import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { AuthenticatedUser } from '../common/api-auth.guard';
import { parsePagination } from '../common/pagination.util';
import type {
  DriverRouteAssignmentDto,
  DriverRoutesResponseDto,
} from './dto/routes.dto';

@Injectable()
export class DriverRoutesService {
  async getRoutes(params: {
    status?: string;
    sourceRankId?: string;
    destRankId?: string;
    page?: string;
    limit?: string;
  }): Promise<DriverRoutesResponseDto> {
    const pagination = parsePagination(params.page, params.limit, {
      limit: 50,
      maxLimit: 200,
    });

    const where: Record<string, unknown> = {};
    where.status = params.status || 'ACTIVE';

    if (params.sourceRankId) {
      where.sourceRankId = params.sourceRankId;
    }

    if (params.destRankId) {
      where.destRankId = params.destRankId;
    }

    const [routes, total] = await Promise.all([
      prisma.route.findMany({
        where,
        include: {
          sourceRank: {
            select: {
              id: true,
              name: true,
              address: true,
              lat: true,
              lng: true,
            },
          },
          destRank: {
            select: {
              id: true,
              name: true,
              address: true,
              lat: true,
              lng: true,
            },
          },
          popularLocations: true,
        },
        orderBy: { name: 'asc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.route.count({ where }),
    ]);

    return {
      routes: routes.map((route) => ({
        id: route.id,
        name: route.name,
        description: route.description,
        distance: route.distance,
        baseFare: Number(route.baseFare),
        estimatedDuration: route.estimatedDuration,
        polyline: route.polyline,
        status: route.status,
        sourceRank: {
          id: route.sourceRank.id,
          name: route.sourceRank.name,
          address: route.sourceRank.address,
          lat: route.sourceRank.lat,
          lng: route.sourceRank.lng,
        },
        destRank: route.destRank
          ? {
              id: route.destRank.id,
              name: route.destRank.name,
              address: route.destRank.address,
              lat: route.destRank.lat,
              lng: route.destRank.lng,
            }
          : null,
        popularLocations: route.popularLocations.map((location) => ({
          id: location.id,
          name: location.name,
          address: location.address,
          lat: location.lat,
          lng: location.lng,
          type: location.type,
        })),
      })),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async assignDriverRoute(
    user: AuthenticatedUser,
    body: { taxiId?: string; routeId?: string },
  ): Promise<DriverRouteAssignmentDto> {
    if (!body.taxiId || !body.routeId) {
      throw new BadRequestException('Missing taxiId or routeId');
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: user.userId },
      include: { taxis: true },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const ownsTaxi = driver.taxis.some((t) => t.id === body.taxiId);
    if (!ownsTaxi) {
      throw new UnauthorizedException('Taxi not owned by driver');
    }

    const existingAssignment = await prisma.taxiOnRoute.findUnique({
      where: {
        taxiId_routeId: {
          taxiId: body.taxiId,
          routeId: body.routeId,
        },
      },
    });

    if (existingAssignment) {
      const updated = await prisma.taxiOnRoute.update({
        where: {
          taxiId_routeId: {
            taxiId: body.taxiId,
            routeId: body.routeId,
          },
        },
        data: {
          isActive: true,
        },
      });

      return {
        id: updated.id,
        taxiId: updated.taxiId,
        routeId: updated.routeId,
        isActive: updated.isActive,
      };
    }

    const created = await prisma.taxiOnRoute.create({
      data: {
        taxiId: body.taxiId,
        routeId: body.routeId,
        isActive: true,
      },
    });

    return {
      id: created.id,
      taxiId: created.taxiId,
      routeId: created.routeId,
      isActive: created.isActive,
    };
  }
}
