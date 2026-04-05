import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { AuthenticatedUser } from '../common/api-auth.guard';

@Injectable()
export class DriverMeService {
  async getDriverMe(user: AuthenticatedUser) {
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

    return driver;
  }

  async patchDriverMe(
    user: AuthenticatedUser,
    body: {
      status?: string;
      isOnline?: boolean;
      phone?: string;
      email?: string;
      address?: string;
      firstName?: string;
      lastName?: string;
    },
  ) {
    const driver = await prisma.driver.update({
      where: { userId: user.userId },
      data: {
        status: body.status || undefined,
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

    return driver;
  }
}
