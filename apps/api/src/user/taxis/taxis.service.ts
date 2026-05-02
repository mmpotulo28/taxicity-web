import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { Request } from 'express';
import type { AuthenticatedRequest } from '../../driver/common/api-auth.guard';
import type {
  EntityDto,
  TaxiLocationHistoryResponseDto,
  TaxisListResponseDto,
} from '../common/user-api.dto';
import { UserApiHelpers } from '../common/user-api.helpers';

@Injectable()
export class UserTaxisService {
  constructor(private readonly userApiHelpers: UserApiHelpers) {}

  listTaxis(
    query: Record<string, string | undefined>,
  ): Promise<TaxisListResponseDto> {
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.driverId) where.driverId = query.driverId;
    if (query.available === 'true') where.status = 'AVAILABLE';

    if (query.rankId) {
      where.taxiRanks = {
        some: {
          rankId: query.rankId,
        },
      };
    }

    if (query.routeId) {
      where.OR = [
        {
          vehicleTrips: {
            some: {
              routeId: query.routeId,
              status: { in: ['BOARDING', 'IN_PROGRESS'] },
            },
          },
        },
        {
          routes: {
            some: {
              routeId: query.routeId,
              isActive: true,
            },
          },
        },
      ];
    }

    const paging = this.userApiHelpers.parsePaging(query.page, query.limit);

    return Promise.all([
      prisma.taxi.findMany({
        where,
        include: {
          driver: true,
          currentLocation: true,
          taxiRanks: {
            include: {
              rank: true,
            },
          },
          routes: {
            include: {
              route: true,
            },
            where: { isActive: true },
          },
          vehicleTrips: {
            where: {
              status: { in: ['BOARDING', 'IN_PROGRESS'] },
            },
            include: {
              route: true,
            },
            take: 1,
          },
          _count: {
            select: {
              trips: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: paging.skip,
        take: paging.limit,
      }),
      prisma.taxi.count({ where }),
    ]).then(([taxis, total]) => ({
      taxis,
      pagination: {
        page: paging.page,
        limit: paging.limit,
        total,
        pages: Math.ceil(total / paging.limit),
      },
    }));
  }

  async getTaxiById(id: string): Promise<EntityDto> {
    const taxi = await prisma.taxi.findUnique({
      where: { id },
      include: {
        driver: true,
        currentLocation: true,
        locationHistory: true,
        routes: {
          include: {
            route: true,
          },
        },
        taxiRanks: {
          include: {
            rank: true,
          },
        },
        trips: {
          orderBy: { requestTime: 'desc' },
          take: 20,
          include: {
            route: true,
            rank: true,
          },
        },
        maintenanceLog: true,
        _count: {
          select: {
            trips: true,
            routes: true,
            taxiRanks: true,
          },
        },
      },
    });

    if (!taxi) {
      throw new NotFoundException('Taxi not found');
    }

    return taxi;
  }

  createTaxi(req: Request, body: Record<string, unknown>): Promise<EntityDto> {
    this.userApiHelpers.ensureAdmin(req);

    return prisma.taxi.create({
      data: {
        licensePlate: this.userApiHelpers.asString(body.licensePlate),
        model: this.userApiHelpers.asString(body.model),
        make: this.userApiHelpers.asString(body.make),
        year: body.year === undefined ? undefined : Number(body.year),
        color: this.userApiHelpers.asString(body.color),
        capacity: Number(body.capacity ?? 0),
        driverId: this.userApiHelpers.asString(body.driverId),
        registrationDoc:
          typeof body.registrationDoc === 'string'
            ? body.registrationDoc
            : undefined,
        insuranceDoc:
          typeof body.insuranceDoc === 'string' ? body.insuranceDoc : undefined,
      },
      include: {
        driver: true,
      },
    });
  }

  updateTaxi(
    req: Request,
    id: string,
    body: Record<string, unknown>,
  ): Promise<EntityDto> {
    this.userApiHelpers.ensureAdmin(req);

    return prisma.taxi.update({
      where: { id },
      data: {
        model: typeof body.model === 'string' ? body.model : undefined,
        make: typeof body.make === 'string' ? body.make : undefined,
        year: body.year === undefined ? undefined : Number(body.year),
        color: typeof body.color === 'string' ? body.color : undefined,
        capacity:
          body.capacity === undefined ? undefined : Number(body.capacity),
        status:
          typeof body.status === 'string'
            ? (body.status as 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'MAINTENANCE')
            : undefined,
        registrationDoc:
          typeof body.registrationDoc === 'string'
            ? body.registrationDoc
            : undefined,
        insuranceDoc:
          typeof body.insuranceDoc === 'string' ? body.insuranceDoc : undefined,
      },
      include: {
        driver: true,
      },
    });
  }

  async getTaxiLocation(id: string): Promise<EntityDto> {
    const location = await prisma.taxiLocation.findFirst({
      where: { taxiId: id },
      orderBy: { createdAt: 'desc' },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  updateTaxiLocation(
    req: AuthenticatedRequest,
    id: string,
    body: Record<string, unknown>,
  ): Promise<EntityDto> {
    this.userApiHelpers.getUserId(req);

    return prisma.taxi.findUnique({ where: { id } }).then(async (taxi) => {
      if (!taxi) {
        throw new NotFoundException('Taxi not found');
      }

      const lat = Number(body.lat ?? Number.NaN);
      const lng = Number(body.lng ?? Number.NaN);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new BadRequestException('Invalid data');
      }

      const heading =
        body.heading === undefined ? undefined : Number(body.heading as number);
      const speed =
        body.speed === undefined ? undefined : Number(body.speed as number);

      const [currentLocation] = await Promise.all([
        prisma.taxiLocation.upsert({
          where: { taxiId: id },
          update: {
            lat,
            lng,
            heading,
            speed,
          },
          create: {
            taxiId: id,
            lat,
            lng,
            heading,
            speed,
          },
        }),
        prisma.taxiLocation.create({
          data: {
            taxiHistoryId: id,
            lat,
            lng,
            heading,
            speed,
          },
        }),
      ]);

      return currentLocation;
    });
  }

  taxiLocationHistory(
    id: string,
    query: Record<string, string | undefined>,
  ): Promise<TaxiLocationHistoryResponseDto> {
    const paging = this.userApiHelpers.parsePaging(query.page, query.limit, 50);

    return Promise.all([
      prisma.taxiLocation.findMany({
        where: { taxiHistoryId: id },
        orderBy: { createdAt: 'desc' },
        skip: paging.skip,
        take: paging.limit,
      }),
      prisma.taxiLocation.count({ where: { taxiHistoryId: id } }),
    ]).then(([locations, total]) => ({
      locations,
      pagination: {
        page: paging.page,
        limit: paging.limit,
        total,
        pages: Math.ceil(total / paging.limit),
      },
    }));
  }
}
