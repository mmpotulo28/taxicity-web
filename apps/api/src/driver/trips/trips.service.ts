import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma, redis } from '@taxiciti/database';
import { pusherServer } from '@taxiciti/utils';
import type { AuthenticatedUser } from '../common/api-auth.guard';

@Injectable()
export class DriverTripsService {
  async getActiveTrips(user: AuthenticatedUser) {
    const driver = await prisma.driver.findUnique({
      where: { userId: user.userId },
      include: {
        taxis: true,
      },
    });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    const taxiIds = driver.taxis.map((t) => t.id);

    const activeTrips = await prisma.trip.findMany({
      where: {
        taxiId: { in: taxiIds },
        status: { in: ['ACCEPTED', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS'] },
      },
      orderBy: {
        requestTime: 'desc',
      },
      include: {
        route: true,
        taxi: true,
      },
    });

    return { trips: activeTrips };
  }

  async getVehicleTrips(user: AuthenticatedUser) {
    const driver = await prisma.driver.findUnique({
      where: { userId: user.userId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const trips = await prisma.vehicleTrip.findMany({
      where: {
        driverId: driver.id,
        status: { in: ['SCHEDULED', 'BOARDING', 'IN_PROGRESS'] },
      },
      include: {
        route: {
          include: {
            popularLocations: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        taxi: true,
        passengers: {
          where: {
            status: { in: ['ACCEPTED', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS'] },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const activeTrip = trips.find((t) =>
      ['BOARDING', 'IN_PROGRESS'].includes(t.status),
    );

    if (activeTrip) {
      await redis.set(`driver:${user.userId}:active_taxi`, activeTrip.taxiId, {
        ex: 43200,
      });
    }

    return trips;
  }

  async createVehicleTrip(
    user: AuthenticatedUser,
    body: { taxiId?: string; routeId?: string },
  ) {
    if (!body.taxiId || !body.routeId) {
      throw new BadRequestException('Invalid data');
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: user.userId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const taxi = await prisma.taxi.findUnique({
      where: { id: body.taxiId },
    });

    if (!taxi) {
      throw new NotFoundException('Taxi not found');
    }

    const activeTrip = await prisma.vehicleTrip.findFirst({
      where: {
        taxiId: body.taxiId,
        status: { in: ['BOARDING', 'IN_PROGRESS'] },
      },
    });

    if (activeTrip) {
      throw new BadRequestException('Taxi already has an active trip');
    }

    await prisma.rankQueueEntry.deleteMany({
      where: { driverId: driver.id },
    });

    const vehicleTrip = await prisma.vehicleTrip.create({
      data: {
        driverId: driver.id,
        taxiId: body.taxiId,
        routeId: body.routeId,
        capacity: taxi.capacity,
        status: 'BOARDING',
        startTime: new Date(),
      },
      include: {
        route: true,
        taxi: true,
        passengers: true,
      },
    });

    await redis.set(`driver:${user.userId}:active_taxi`, body.taxiId, {
      ex: 43200,
    });

    return vehicleTrip;
  }

  async updateVehicleTrip(
    user: AuthenticatedUser,
    id: string,
    body: { status?: string; manualPassengers?: number },
  ) {
    const allowedStatuses = [
      'BOARDING',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
    ];

    if (body.status && !allowedStatuses.includes(body.status)) {
      throw new BadRequestException('Invalid payload');
    }

    const vehicleTrip = await prisma.vehicleTrip.findUnique({
      where: { id },
      include: { driver: true },
    });

    if (!vehicleTrip) {
      throw new NotFoundException('Trip not found');
    }

    if (vehicleTrip.driver.userId !== user.userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) {
      updateData.status = body.status;
      if (body.status === 'COMPLETED') {
        updateData.endTime = new Date();
      }
    }

    if (typeof body.manualPassengers === 'number') {
      updateData.manualPassengers = body.manualPassengers;
    }

    return prisma.vehicleTrip.update({
      where: { id },
      data: updateData,
    });
  }

  async acceptPassenger(
    user: AuthenticatedUser,
    vehicleTripId: string,
    passengerTripId: string,
  ) {
    const vehicleTrip = await prisma.vehicleTrip.findUnique({
      where: { id: vehicleTripId },
      include: {
        driver: true,
        passengers: {
          where: {
            status: { in: ['ACCEPTED', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS'] },
          },
        },
      },
    });

    if (!vehicleTrip) {
      throw new NotFoundException('Vehicle Trip not found');
    }

    if (vehicleTrip.driver.userId !== user.userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (vehicleTrip.passengers.length >= vehicleTrip.capacity) {
      throw new BadRequestException('Vehicle is full');
    }

    const passengerTrip = await prisma.trip.findUnique({
      where: { id: passengerTripId },
    });

    if (!passengerTrip) {
      throw new NotFoundException('Passenger request not found');
    }

    if (passengerTrip.status !== 'REQUESTED') {
      throw new BadRequestException('Request no longer valid');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completedTripsCount = await prisma.vehicleTrip.count({
      where: {
        driverId: vehicleTrip.driver.id,
        status: 'COMPLETED',
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const feeRate = completedTripsCount > 100 ? 0.035 : 0.05;
    const fare = Number(passengerTrip.fare);
    const platformFee = Math.min(fare * feeRate, 10);

    const updatedPassengerTrip = await prisma.trip.update({
      where: { id: passengerTripId },
      data: {
        status: 'ACCEPTED',
        vehicleTrip: {
          connect: { id: vehicleTrip.id },
        },
        taxi: {
          connect: { id: vehicleTrip.taxiId },
        },
        acceptTime: new Date(),
        platformFee,
      },
      include: {
        taxi: {
          include: {
            driver: true,
          },
        },
        route: true,
        vehicleTrip: {
          include: {
            passengers: true,
          },
        },
      },
    });

    await pusherServer.trigger(
      `trip-${passengerTripId}`,
      'trip-updated',
      updatedPassengerTrip,
    );

    await pusherServer.trigger(
      `route-${passengerTrip.routeId}`,
      'trip-cancelled',
      {
        id: passengerTripId,
        reason: 'Request accepted by another driver.',
      },
    );

    return updatedPassengerTrip;
  }
}
