import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { Request } from 'express';
import type { DriversListResponseDto, EntityDto } from '../common/user-api.dto';
import { UserApiHelpers } from '../common/user-api.helpers';

@Injectable()
export class UserDriversService {
  constructor(private readonly userApiHelpers: UserApiHelpers) {}

  listDrivers(
    query: Record<string, string | undefined>,
  ): Promise<DriversListResponseDto> {
    const where: Record<string, unknown> = {};
    if (query.status) {
      where.status = query.status;
    }

    const paging = this.userApiHelpers.parsePaging(query.page, query.limit);

    return Promise.all([
      prisma.driver.findMany({
        where,
        include: {
          taxis: {
            include: {
              currentLocation: true,
            },
          },
          _count: {
            select: {
              taxis: true,
              tripRatings: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: paging.skip,
        take: paging.limit,
      }),
      prisma.driver.count({ where }),
    ]).then(([drivers, total]) => ({
      drivers,
      pagination: {
        page: paging.page,
        limit: paging.limit,
        total,
        pages: Math.ceil(total / paging.limit),
      },
    }));
  }

  async getDriverById(id: string): Promise<EntityDto> {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        taxis: {
          include: {
            currentLocation: true,
            routes: {
              include: {
                route: true,
              },
              where: { isActive: true },
            },
            taxiRanks: {
              include: {
                rank: true,
              },
            },
          },
        },
        tripRatings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            trip: true,
          },
        },
        favoriteOfUsers: true,
        _count: {
          select: {
            taxis: true,
            tripRatings: true,
            favoriteOfUsers: true,
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const ratings = driver.tripRatings.map((rating) => rating.rating);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
        : 0;

    return {
      ...driver,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }

  createDriver(
    req: Request,
    body: Record<string, unknown>,
  ): Promise<EntityDto> {
    this.userApiHelpers.ensureAdmin(req);

    return prisma.driver.create({
      data: {
        firstName: this.userApiHelpers.asString(body.firstName),
        lastName: this.userApiHelpers.asString(body.lastName),
        fullName:
          `${this.userApiHelpers.asString(body.firstName)} ${this.userApiHelpers.asString(body.lastName)}`.trim(),
        phone: this.userApiHelpers.asString(body.phone),
        email: typeof body.email === 'string' ? body.email : undefined,
        profileImage:
          typeof body.profileImage === 'string' ? body.profileImage : undefined,
        licenseNumber: this.userApiHelpers.asString(body.licenseNumber),
        licenseExpiry: new Date(
          this.userApiHelpers.asString(
            body.licenseExpiry,
            new Date().toISOString(),
          ),
        ),
        dateOfBirth:
          typeof body.dateOfBirth === 'string'
            ? new Date(body.dateOfBirth)
            : undefined,
        address: typeof body.address === 'string' ? body.address : undefined,
      },
    });
  }

  updateDriver(
    req: Request,
    id: string,
    body: Record<string, unknown>,
  ): Promise<EntityDto> {
    this.userApiHelpers.ensureAdmin(req);

    const firstName =
      typeof body.firstName === 'string' ? body.firstName : undefined;
    const lastName =
      typeof body.lastName === 'string' ? body.lastName : undefined;

    return prisma.driver.update({
      where: { id },
      data: {
        firstName,
        lastName,
        fullName:
          firstName || lastName
            ? `${firstName ?? ''} ${lastName ?? ''}`.trim()
            : undefined,
        phone: typeof body.phone === 'string' ? body.phone : undefined,
        email: typeof body.email === 'string' ? body.email : undefined,
        profileImage:
          typeof body.profileImage === 'string' ? body.profileImage : undefined,
        licenseExpiry:
          typeof body.licenseExpiry === 'string'
            ? new Date(body.licenseExpiry)
            : undefined,
        dateOfBirth:
          typeof body.dateOfBirth === 'string'
            ? new Date(body.dateOfBirth)
            : undefined,
        address: typeof body.address === 'string' ? body.address : undefined,
        status:
          typeof body.status === 'string'
            ? (body.status as
                | 'ACTIVE'
                | 'INACTIVE'
                | 'SUSPENDED'
                | 'PENDING_VERIFICATION')
            : undefined,
      },
    });
  }
}
