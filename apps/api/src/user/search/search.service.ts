import { Injectable } from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { AuthenticatedRequest } from '../../driver/common/api-auth.guard';
import type { SearchResponseDto } from '../common/user-api.dto';
import { UserApiHelpers } from '../common/user-api.helpers';

@Injectable()
export class UserSearchService {
  constructor(private readonly userApiHelpers: UserApiHelpers) {}

  search(
    req: AuthenticatedRequest,
    query: Record<string, string | undefined>,
  ): Promise<SearchResponseDto> {
    this.userApiHelpers.getUserId(req);

    const raw = (query.query ?? '').trim();
    const type = (query.type ?? 'all').toLowerCase();
    const paging = this.userApiHelpers.parsePaging(query.page, query.limit, 10);

    if (!raw) {
      return Promise.resolve({
        query: raw,
        type,
        results: {
          taxis: [],
          drivers: [],
          routes: [],
          ranks: [],
          users: [],
        },
        total: 0,
      });
    }

    const shouldSearch = (itemType: string) =>
      type === 'all' || type === itemType;

    return Promise.all([
      shouldSearch('taxis')
        ? prisma.taxi.findMany({
            where: {
              OR: [
                { licensePlate: { contains: raw, mode: 'insensitive' } },
                { model: { contains: raw, mode: 'insensitive' } },
                { make: { contains: raw, mode: 'insensitive' } },
              ],
            },
            include: {
              driver: true,
              currentLocation: true,
            },
            take: paging.limit,
          })
        : Promise.resolve([]),
      shouldSearch('drivers')
        ? prisma.driver.findMany({
            where: {
              OR: [
                { firstName: { contains: raw, mode: 'insensitive' } },
                { lastName: { contains: raw, mode: 'insensitive' } },
                { fullName: { contains: raw, mode: 'insensitive' } },
                { phone: { contains: raw, mode: 'insensitive' } },
              ],
            },
            include: {
              taxis: true,
            },
            take: paging.limit,
          })
        : Promise.resolve([]),
      shouldSearch('routes')
        ? prisma.route.findMany({
            where: {
              OR: [
                { name: { contains: raw, mode: 'insensitive' } },
                { description: { contains: raw, mode: 'insensitive' } },
              ],
            },
            include: {
              sourceRank: true,
              destRank: true,
            },
            take: paging.limit,
          })
        : Promise.resolve([]),
      shouldSearch('ranks')
        ? prisma.rank.findMany({
            where: {
              OR: [
                { name: { contains: raw, mode: 'insensitive' } },
                { address: { contains: raw, mode: 'insensitive' } },
                { city: { contains: raw, mode: 'insensitive' } },
                { region: { contains: raw, mode: 'insensitive' } },
              ],
            },
            take: paging.limit,
          })
        : Promise.resolve([]),
    ]).then(([taxis, drivers, routes, ranks]) => ({
      query: raw,
      type,
      results: {
        taxis,
        drivers,
        routes,
        ranks,
        users: [],
      },
      total: taxis.length + drivers.length + routes.length + ranks.length,
    }));
  }
}
