import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { AuthenticatedUser } from '../common/api-auth.guard';
import type { DriverMeDto } from './dto/me.dto';

type DriverStatusInput =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'PENDING_VERIFICATION';

const DRIVER_STATUS_VALUES = new Set<DriverStatusInput>([
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'PENDING_VERIFICATION',
]);

function isDriverStatusInput(value: string): value is DriverStatusInput {
  return DRIVER_STATUS_VALUES.has(value as DriverStatusInput);
}

@Injectable()
export class DriverMeService {
  private mapDriverToDto(driver: {
    id: string;
    userId: string | null;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    status: string;
    taxis: Array<{
      id: string;
      licensePlate: string;
      make: string;
      model: string;
      year: number | null;
      color: string;
      capacity: number;
      status: string;
      routes: Array<{
        id: string;
        isActive: boolean;
        route: { id: string; name: string };
      }>;
    }>;
  }): DriverMeDto {
    return {
      id: driver.id,
      userId: driver.userId,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phone: driver.phone,
      address: driver.address,
      status: isDriverStatusInput(driver.status)
        ? driver.status
        : 'PENDING_VERIFICATION',
      taxis: driver.taxis.map((taxi) => ({
        id: taxi.id,
        licensePlate: taxi.licensePlate,
        make: taxi.make,
        model: taxi.model,
        year: taxi.year,
        color: taxi.color,
        capacity: taxi.capacity,
        status: taxi.status,
        routes: taxi.routes.map((route) => ({
          id: route.id,
          isActive: route.isActive,
          route: {
            id: route.route.id,
            name: route.route.name,
          },
        })),
      })),
    };
  }

  async getDriverMe(user: AuthenticatedUser): Promise<DriverMeDto> {
    let driver = await prisma.driver.findUnique({
      where: { userId: user.userId },
      include: {
        taxis: {
          include: {
            routes: {
              where: { isActive: true },
              include: {
                route: true,
              },
            },
          },
        },
      },
    });

    if (!driver && user.email) {
      driver = await prisma.driver.findUnique({
        where: { email: user.email },
        include: {
          taxis: {
            include: {
              routes: {
                where: { isActive: true },
                include: {
                  route: true,
                },
              },
            },
          },
        },
      });

      if (driver) {
        driver = await prisma.driver.update({
          where: { id: driver.id },
          data: { userId: user.userId },
          include: {
            taxis: {
              include: {
                routes: {
                  where: { isActive: true },
                  include: {
                    route: true,
                  },
                },
              },
            },
          },
        });
      }
    }

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return this.mapDriverToDto(driver);
  }

  async patchDriverMe(
    user: AuthenticatedUser,
    body: {
      status?: DriverStatusInput;
      isOnline?: boolean;
      phone?: string;
      email?: string;
      address?: string;
      firstName?: string;
      lastName?: string;
    },
  ): Promise<DriverMeDto> {
    const nextStatus =
      typeof body.status === 'string' && isDriverStatusInput(body.status)
        ? body.status
        : undefined;

    const driver = await prisma.driver.update({
      where: { userId: user.userId },
      data: {
        status: nextStatus,
        phone: body.phone || undefined,
        email: body.email || undefined,
        address: body.address || undefined,
        firstName: body.firstName || undefined,
        lastName: body.lastName || undefined,
      },
    });

    if (typeof body.isOnline === 'boolean') {
      if (body.isOnline) {
        await prisma.taxi.updateMany({
          where: {
            driverId: driver.id,
            status: { not: 'MAINTENANCE' },
          },
          data: { status: 'AVAILABLE' },
        });
      } else {
        await prisma.taxi.updateMany({
          where: { driverId: driver.id },
          data: { status: 'OFFLINE' },
        });
      }
    }

    return this.getDriverMe(user);
  }
}
