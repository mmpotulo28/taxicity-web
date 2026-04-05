import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { AuthenticatedUser } from '../common/api-auth.guard';

@Injectable()
export class DriverVehicleService {
  async createVehicle(
    user: AuthenticatedUser,
    body: {
      plateNumber?: string;
      model?: string;
      make?: string;
      color?: string;
      seats?: string;
    },
  ) {
    if (
      !body.plateNumber ||
      !body.model ||
      !body.make ||
      !body.color ||
      !body.seats
    ) {
      throw new BadRequestException('Missing required fields');
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: user.userId },
    });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    return prisma.taxi.create({
      data: {
        licensePlate: body.plateNumber,
        model: body.model,
        make: body.make,
        color: body.color,
        capacity: Number.parseInt(body.seats, 10),
        driverId: driver.id,
        status: 'AVAILABLE',
      },
    });
  }

  async updateVehicleRoute(
    user: AuthenticatedUser,
    taxiId: string,
    body: { routeId?: string; permitDoc?: string },
  ) {
    if (!body.routeId || !body.permitDoc) {
      throw new BadRequestException('Validation Error');
    }

    const routeId = body.routeId;
    const permitDoc = body.permitDoc;

    const taxi = await prisma.taxi.findUnique({
      where: { id: taxiId },
      include: { driver: true },
    });

    if (!taxi || taxi.driver?.userId !== user.userId) {
      throw new NotFoundException('Taxi not found or unauthorized');
    }

    await prisma.$transaction(async (tx) => {
      await tx.taxi.update({
        where: { id: taxiId },
        data: { permitDoc },
      });

      await tx.taxiOnRoute.updateMany({
        where: { taxiId },
        data: { isActive: false },
      });

      const existingRelation = await tx.taxiOnRoute.findUnique({
        where: {
          taxiId_routeId: {
            taxiId,
            routeId,
          },
        },
      });

      if (existingRelation) {
        await tx.taxiOnRoute.update({
          where: { id: existingRelation.id },
          data: { isActive: true },
        });
      } else {
        await tx.taxiOnRoute.create({
          data: {
            taxiId,
            routeId,
            isActive: true,
          },
        });
      }
    });

    return { success: true };
  }
}
