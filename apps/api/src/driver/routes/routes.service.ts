import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { AuthenticatedUser } from '../common/api-auth.guard';
import { parsePagination } from '../common/pagination.util';

@Injectable()
export class DriverRoutesService {
  async getRoutes(params: {
    status?: string;
    sourceRankId?: string;
    destRankId?: string;
    page?: string;
    limit?: string;
  }) {
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
      routes,
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
  ) {
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
      return prisma.taxiOnRoute.update({
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
    }

    return prisma.taxiOnRoute.create({
      data: {
        taxiId: body.taxiId,
        routeId: body.routeId,
        isActive: true,
      },
    });
  }
}
