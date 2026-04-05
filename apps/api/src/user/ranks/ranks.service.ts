import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { Request } from 'express';
import type {
  ApiMessageDto,
  EntityDto,
  RanksListResponseDto,
} from '../common/user-api.dto';
import { UserApiHelpers } from '../common/user-api.helpers';

@Injectable()
export class UserRanksService {
  constructor(private readonly userApiHelpers: UserApiHelpers) {}

  listRanks(
    query: Record<string, string | undefined>,
  ): Promise<RanksListResponseDto> {
    const where: Record<string, string | boolean> = {};
    if (query.region) where.region = query.region;
    if (query.city) where.city = query.city;
    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    const paging = this.userApiHelpers.parsePaging(query.page, query.limit);

    return Promise.all([
      prisma.rank.findMany({
        where,
        include: {
          _count: {
            select: {
              sourceRoutes: true,
              destRoutes: true,
              taxiRanks: true,
              trips: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip: paging.skip,
        take: paging.limit,
      }),
      prisma.rank.count({ where }),
    ]).then(([ranks, total]) => ({
      ranks,
      pagination: {
        page: paging.page,
        limit: paging.limit,
        total,
        pages: Math.ceil(total / paging.limit),
      },
    }));
  }

  async getRankById(id: string): Promise<EntityDto> {
    const rank = await prisma.rank.findUnique({
      where: { id },
      include: {
        sourceRoutes: true,
        destRoutes: true,
        taxiRanks: true,
        _count: {
          select: {
            sourceRoutes: true,
            destRoutes: true,
            taxiRanks: true,
            trips: true,
          },
        },
      },
    });

    if (!rank) {
      throw new NotFoundException('Rank not found');
    }

    return rank;
  }

  createRank(req: Request, body: Record<string, unknown>): Promise<EntityDto> {
    this.userApiHelpers.ensureAdmin(req);

    return prisma.rank.create({
      data: {
        name: this.userApiHelpers.asString(body.name),
        address: this.userApiHelpers.asString(body.address),
        city: this.userApiHelpers.asString(body.city),
        province: this.userApiHelpers.asString(body.province),
        region: this.userApiHelpers.asString(body.region),
        description:
          typeof body.description === 'string' ? body.description : undefined,
        lat: Number(body.lat ?? 0),
        lng: Number(body.lng ?? 0),
        phone: typeof body.phone === 'string' ? body.phone : undefined,
        operatingHours:
          typeof body.operatingHours === 'string'
            ? body.operatingHours
            : undefined,
        capacity:
          body.capacity === undefined ? undefined : Number(body.capacity),
        image: typeof body.image === 'string' ? body.image : undefined,
      },
    });
  }

  updateRank(
    req: Request,
    id: string,
    body: Record<string, unknown>,
  ): Promise<EntityDto> {
    this.userApiHelpers.ensureAdmin(req);

    return prisma.rank.update({
      where: { id },
      data: {
        name: typeof body.name === 'string' ? body.name : undefined,
        address: typeof body.address === 'string' ? body.address : undefined,
        city: typeof body.city === 'string' ? body.city : undefined,
        province: typeof body.province === 'string' ? body.province : undefined,
        region: typeof body.region === 'string' ? body.region : undefined,
        description:
          typeof body.description === 'string' ? body.description : undefined,
        lat: body.lat === undefined ? undefined : Number(body.lat),
        lng: body.lng === undefined ? undefined : Number(body.lng),
        phone: typeof body.phone === 'string' ? body.phone : undefined,
        operatingHours:
          typeof body.operatingHours === 'string'
            ? body.operatingHours
            : undefined,
        capacity:
          body.capacity === undefined ? undefined : Number(body.capacity),
        image: typeof body.image === 'string' ? body.image : undefined,
        isActive:
          typeof body.isActive === 'boolean' ? body.isActive : undefined,
      },
    });
  }

  async deleteRank(req: Request, id: string): Promise<ApiMessageDto> {
    this.userApiHelpers.ensureAdmin(req);
    await prisma.rank.delete({ where: { id } });
    return { message: 'Rank deleted successfully' };
  }
}
