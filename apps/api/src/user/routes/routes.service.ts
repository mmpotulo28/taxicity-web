import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { Request } from 'express';
import type {
  ApiMessageDto,
  EntityDto,
  RoutesListResponseDto,
} from '../common/user-api.dto';
import { UserApiHelpers } from '../common/user-api.helpers';

@Injectable()
export class UserRoutesService {
  constructor(private readonly userApiHelpers: UserApiHelpers) {}

  listRoutes(
    query: Record<string, string | undefined>,
  ): Promise<RoutesListResponseDto> {
    const where: Record<string, string> = {};
    if (query.status) where.status = query.status;
    if (query.sourceRankId) where.sourceRankId = query.sourceRankId;
    if (query.destRankId) where.destRankId = query.destRankId;

    const paging = this.userApiHelpers.parsePaging(query.page, query.limit);

    return Promise.all([
      prisma.route.findMany({
        where,
        include: {
          sourceRank: true,
          destRank: true,
          popularLocations: true,
          _count: {
            select: {
              taxis: true,
              trips: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip: paging.skip,
        take: paging.limit,
      }),
      prisma.route.count({ where }),
    ]).then(([routes, total]) => ({
      routes,
      pagination: {
        page: paging.page,
        limit: paging.limit,
        total,
        pages: Math.ceil(total / paging.limit),
      },
    }));
  }

  async getRouteById(id: string): Promise<EntityDto> {
    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        sourceRank: true,
        destRank: true,
        popularLocations: true,
        taxis: {
          include: {
            taxi: true,
          },
        },
        _count: {
          select: {
            taxis: true,
            trips: true,
          },
        },
      },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  createRoute(req: Request, body: Record<string, unknown>): Promise<EntityDto> {
    this.userApiHelpers.ensureAdmin(req);

    return prisma.route.create({
      data: {
        name: this.userApiHelpers.asString(body.name),
        description:
          typeof body.description === 'string' ? body.description : undefined,
        distance: Number(body.distance ?? 0),
        baseFare: Number(body.baseFare ?? 0),
        estimatedDuration: Number(body.estimatedDuration ?? 0),
        sourceRankId: this.userApiHelpers.asString(body.sourceRankId),
        destRankId:
          typeof body.destRankId === 'string' ? body.destRankId : undefined,
        status:
          typeof body.status === 'string'
            ? (body.status as 'ACTIVE' | 'BUSY' | 'INACTIVE')
            : 'ACTIVE',
      },
      include: {
        sourceRank: true,
        destRank: true,
      },
    });
  }

  updateRoute(
    req: Request,
    id: string,
    body: Record<string, unknown>,
  ): Promise<EntityDto> {
    this.userApiHelpers.ensureAdmin(req);

    return prisma.route.update({
      where: { id },
      data: {
        name: typeof body.name === 'string' ? body.name : undefined,
        description:
          typeof body.description === 'string' ? body.description : undefined,
        distance:
          body.distance === undefined ? undefined : Number(body.distance),
        baseFare:
          body.baseFare === undefined ? undefined : Number(body.baseFare),
        estimatedDuration:
          body.estimatedDuration === undefined
            ? undefined
            : Number(body.estimatedDuration),
        status:
          typeof body.status === 'string'
            ? (body.status as 'ACTIVE' | 'BUSY' | 'INACTIVE')
            : undefined,
      },
    });
  }

  async deleteRoute(req: Request, id: string): Promise<ApiMessageDto> {
    this.userApiHelpers.ensureAdmin(req);
    await prisma.route.delete({ where: { id } });
    return { message: 'Route deleted successfully' };
  }
}
