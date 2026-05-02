import { Injectable } from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import { parsePagination } from '../common/pagination.util';

@Injectable()
export class DriverRanksService {
  async getRanks(params: {
    region?: string;
    city?: string;
    page?: string;
    limit?: string;
  }) {
    const pagination = parsePagination(params.page, params.limit, {
      limit: 100,
      maxLimit: 200,
    });

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (params.region) {
      where.region = params.region;
    }

    if (params.city) {
      where.city = params.city;
    }

    const [ranks, total] = await Promise.all([
      prisma.rank.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.rank.count({ where }),
    ]);

    return {
      ranks,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit),
      },
    };
  }
}
