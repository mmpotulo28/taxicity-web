import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma, redis } from '@taxiciti/database';
import { pusherServer } from '@taxiciti/utils';
import type { AuthenticatedUser } from '../common/api-auth.guard';
import type {
  AcceptedPassengerDto,
  ActiveTripsResponseDto,
  VehicleTripDto,
} from './dto/trips.dto';

@Injectable()
export class DriverTripsService {
  private readonly logger = new Logger(DriverTripsService.name);

  private async cacheActiveTaxi(userId: string, taxiId: string): Promise<void> {
    try {
      await redis.set(`driver:${userId}:active_taxi`, taxiId, {
        ex: 43200,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to cache active taxi for user ${userId}: ${error instanceof Error ? error.message : 'Unknown redis error'}`,
      );
    }
  }

  private mapVehicleTripToDto(vehicleTrip: {
    id: string;
    status: string;
    capacity: number;
    manualPassengers: number;
    startTime: Date | null;
    endTime: Date | null;
    route: { id: string; name: string } | null;
    taxi: { id: string; licensePlate: string } | null;
    passengers: Array<{
      id: string;
      userId: string;
      status: string;
      fare: unknown;
      paymentMethod: string;
      pickupAddress: string;
      dropoffAddress: string;
    }>;
  }): VehicleTripDto {
    return {
      id: vehicleTrip.id,
      status: vehicleTrip.status,
      capacity: vehicleTrip.capacity,
      manualPassengers: vehicleTrip.manualPassengers,
      startTime: vehicleTrip.startTime
        ? vehicleTrip.startTime.toISOString()
        : null,
      endTime: vehicleTrip.endTime ? vehicleTrip.endTime.toISOString() : null,
      route: vehicleTrip.route
        ? { id: vehicleTrip.route.id, name: vehicleTrip.route.name }
        : null,
      taxi: vehicleTrip.taxi
        ? {
            id: vehicleTrip.taxi.id,
            licensePlate: vehicleTrip.taxi.licensePlate,
          }
        : null,
      passengers: vehicleTrip.passengers.map((passenger) => ({
        id: passenger.id,
        userId: passenger.userId,
        status: passenger.status,
        fare: Number(passenger.fare),
        paymentMethod: passenger.paymentMethod,
        pickupAddress: passenger.pickupAddress,
        dropoffAddress: passenger.dropoffAddress,
      })),
    };
  }

  async getActiveTrips(
    user: AuthenticatedUser,
  ): Promise<ActiveTripsResponseDto> {
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

    return {
      trips: activeTrips.map((trip) => ({
        id: trip.id,
        status: trip.status,
        requestTime: trip.requestTime.toISOString(),
        fare: Number(trip.fare),
        paymentMethod: trip.paymentMethod,
        pickupAddress: trip.pickupAddress,
        dropoffAddress: trip.dropoffAddress,
        route: trip.route ? { id: trip.route.id, name: trip.route.name } : null,
        taxi: trip.taxi
          ? {
              id: trip.taxi.id,
              licensePlate: trip.taxi.licensePlate,
              make: trip.taxi.make,
              model: trip.taxi.model,
            }
          : null,
      })),
    };
  }

  async getVehicleTrips(user: AuthenticatedUser): Promise<VehicleTripDto[]> {
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
      await this.cacheActiveTaxi(user.userId, activeTrip.taxiId);
    }

    return trips.map((trip) => this.mapVehicleTripToDto(trip));
  }

  async createVehicleTrip(
    user: AuthenticatedUser,
    body: { taxiId?: string; routeId?: string },
  ): Promise<VehicleTripDto> {
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

    await this.cacheActiveTaxi(user.userId, body.taxiId);

    return this.mapVehicleTripToDto(vehicleTrip);
  }

  async updateVehicleTrip(
    user: AuthenticatedUser,
    id: string,
    body: { status?: string; manualPassengers?: number },
  ): Promise<VehicleTripDto> {
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

    const updated = await prisma.vehicleTrip.update({
      where: { id },
      data: updateData,
      include: {
        route: true,
        taxi: true,
        passengers: {
          where: {
            status: { in: ['ACCEPTED', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS'] },
          },
        },
      },
    });

    return this.mapVehicleTripToDto(updated);
  }

  async acceptPassenger(
    user: AuthenticatedUser,
    vehicleTripId: string,
    passengerTripId: string,
  ): Promise<AcceptedPassengerDto> {
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

    return {
      id: updatedPassengerTrip.id,
      status: updatedPassengerTrip.status,
      acceptTime: updatedPassengerTrip.acceptTime
        ? updatedPassengerTrip.acceptTime.toISOString()
        : null,
      platformFee: Number(updatedPassengerTrip.platformFee || 0),
      taxiId: updatedPassengerTrip.taxiId,
      routeId: updatedPassengerTrip.routeId,
      vehicleTripId: updatedPassengerTrip.vehicleTripId,
    };
  }
}
