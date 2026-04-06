import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { prisma, redis } from '@taxiciti/database';
import type { PaymentMethod, TripStatus } from '@taxiciti/database/types';

interface CreateRidePayload {
  routeId: string;
  rankId: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  fare: number;
  paymentMethod?: PaymentMethod;
  taxiId?: string;
}

interface AcceptRidePayload {
  requestId: string;
}

interface UpdateRideStatusPayload {
  rideId: string;
  status: TripStatus;
}

interface DeclineRidePayload {
  requestId: string;
}

interface RealtimeTripRecord {
  id: string;
  routeId: string;
  userId: string;
  taxiId: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  requestTime: Date;
  fare: unknown;
  taxi?: {
    driver?: {
      userId?: string | null;
    } | null;
  } | null;
  [key: string]: unknown;
}

interface DriverTaxiRouteLink {
  routeId: string;
}

interface DriverTaxiRecord {
  id: string;
  routes: DriverTaxiRouteLink[];
}

@Injectable()
export class RealtimeTripService {
  private declinedRequestKey(driverUserId: string): string {
    return `driver:${driverUserId}:declined_requests`;
  }

  async getPendingRequestsForDriver(
    driverUserId: string,
  ): Promise<RealtimeTripRecord[]> {
    const driver = await prisma.driver.findUnique({
      where: { userId: driverUserId },
      include: {
        taxis: {
          include: {
            routes: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!driver) {
      throw new WsException('Driver profile not found');
    }

    const driverTaxis = driver.taxis as unknown as DriverTaxiRecord[];
    const activeRouteIds = [
      ...new Set(
        driverTaxis.flatMap((taxi) =>
          taxi.routes.map((route) => route.routeId),
        ),
      ),
    ];

    if (activeRouteIds.length === 0) {
      return [];
    }

    const requests = await prisma.trip.findMany({
      where: {
        status: 'REQUESTED',
        routeId: { in: activeRouteIds },
        OR: [
          { taxiId: null },
          { taxiId: { in: driverTaxis.map((taxi) => taxi.id) } },
        ],
      },
      include: {
        route: true,
        taxi: {
          include: {
            driver: true,
          },
        },
      },
      orderBy: {
        requestTime: 'desc',
      },
    });

    const declinedRequestIds = await redis.smembers<string[]>(
      this.declinedRequestKey(driverUserId),
    );
    const declinedSet = new Set(declinedRequestIds ?? []);

    return (requests as RealtimeTripRecord[]).filter(
      (request) => !declinedSet.has(request.id),
    );
  }

  async getUserTrips(userId: string): Promise<RealtimeTripRecord[]> {
    const trips = await prisma.trip.findMany({
      where: {
        userId,
      },
      include: {
        route: true,
        taxi: {
          include: {
            driver: true,
          },
        },
        rating: true,
      },
      orderBy: {
        requestTime: 'desc',
      },
    });

    return trips as RealtimeTripRecord[];
  }

  async createRideRequest(
    userId: string,
    payload: CreateRidePayload,
  ): Promise<RealtimeTripRecord> {
    if (!payload.routeId || !payload.rankId) {
      throw new WsException('Route and rank are required');
    }

    const trip = await prisma.trip.create({
      data: {
        userId,
        routeId: payload.routeId,
        rankId: payload.rankId,
        pickupAddress: payload.pickupAddress,
        pickupLat: payload.pickupLat,
        pickupLng: payload.pickupLng,
        dropoffAddress: payload.dropoffAddress,
        dropoffLat: payload.dropoffLat,
        dropoffLng: payload.dropoffLng,
        fare: payload.fare,
        paymentMethod: payload.paymentMethod ?? 'CASH',
        paymentStatus: 'PENDING',
        status: 'REQUESTED',
        taxiId: payload.taxiId ?? null,
      },
      include: {
        route: true,
        taxi: {
          include: {
            driver: true,
          },
        },
      },
    });

    return trip as RealtimeTripRecord;
  }

  async acceptRideRequest(
    driverUserId: string,
    payload: AcceptRidePayload,
  ): Promise<{
    updatedTrip: RealtimeTripRecord;
    driverId: string;
    routeId: string;
    userId: string;
  }> {
    const driver = await prisma.driver.findUnique({
      where: { userId: driverUserId },
      include: {
        taxis: {
          include: {
            routes: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!driver) {
      throw new WsException('Driver profile not found');
    }

    const trip = await prisma.trip.findUnique({
      where: { id: payload.requestId },
    });

    if (!trip) {
      throw new WsException('Trip not found');
    }

    if (trip.status !== 'REQUESTED') {
      throw new WsException('Trip is not in requested state');
    }

    const hasDeclined = await redis.sismember(
      this.declinedRequestKey(driverUserId),
      payload.requestId,
    );
    if (hasDeclined) {
      throw new WsException('Trip was previously declined by this driver');
    }

    let acceptingTaxiId: string | null = null;
    const driverTaxis = driver.taxis as unknown as DriverTaxiRecord[];

    if (trip.taxiId) {
      const isDriverTaxi = driverTaxis.some((taxi) => taxi.id === trip.taxiId);
      if (!isDriverTaxi) {
        throw new WsException('Unauthorized for this trip');
      }
      acceptingTaxiId = trip.taxiId;
    } else {
      const eligibleTaxi = driverTaxis.find((taxi) =>
        taxi.routes.some((route) => route.routeId === trip.routeId),
      );

      if (!eligibleTaxi) {
        throw new WsException('No active vehicle found for this route');
      }

      acceptingTaxiId = eligibleTaxi.id;
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: payload.requestId },
      data: {
        status: 'ACCEPTED',
        acceptTime: new Date(),
        taxiId: acceptingTaxiId,
      },
      include: {
        route: true,
        taxi: {
          include: {
            driver: true,
          },
        },
        vehicleTrip: {
          include: {
            passengers: true,
          },
        },
      },
    });

    return {
      updatedTrip: updatedTrip as RealtimeTripRecord,
      driverId: driver.id,
      routeId: trip.routeId,
      userId: trip.userId,
    };
  }

  async declineRideRequest(
    driverUserId: string,
    payload: DeclineRidePayload,
  ): Promise<{ requestId: string }> {
    const driver = await prisma.driver.findUnique({
      where: { userId: driverUserId },
      include: {
        taxis: {
          include: {
            routes: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!driver) {
      throw new WsException('Driver profile not found');
    }

    const trip = await prisma.trip.findUnique({
      where: { id: payload.requestId },
    });

    if (!trip) {
      throw new WsException('Trip not found');
    }

    if (trip.status !== 'REQUESTED') {
      throw new WsException('Trip is not in requested state');
    }

    const driverTaxis = driver.taxis as unknown as DriverTaxiRecord[];
    const isEligibleForRoute = driverTaxis.some((taxi) =>
      taxi.routes.some((route) => route.routeId === trip.routeId),
    );
    const isEligibleForAssignedTaxi =
      !trip.taxiId || driverTaxis.some((taxi) => taxi.id === trip.taxiId);

    if (!isEligibleForRoute || !isEligibleForAssignedTaxi) {
      throw new WsException('Unauthorized for this trip');
    }

    const key = this.declinedRequestKey(driverUserId);
    await redis.sadd(key, payload.requestId);
    await redis.expire(key, 60 * 60 * 6);

    return {
      requestId: payload.requestId,
    };
  }

  async updateRideStatus(
    actorUserId: string,
    payload: UpdateRideStatusPayload,
  ): Promise<RealtimeTripRecord> {
    const trip = await prisma.trip.findUnique({
      where: { id: payload.rideId },
      include: {
        taxi: {
          include: {
            driver: true,
          },
        },
      },
    });

    if (!trip) {
      throw new WsException('Trip not found');
    }

    const actorDriver = await prisma.driver.findUnique({
      where: { userId: actorUserId },
      include: { taxis: true },
    });

    const isPassenger = trip.userId === actorUserId;
    const isAssignedDriver =
      actorDriver &&
      trip.taxiId &&
      actorDriver.taxis.some((taxi) => taxi.id === trip.taxiId);

    if (!isPassenger && !isAssignedDriver) {
      throw new WsException('Unauthorized to update this trip');
    }

    const isPassengerOnly = isPassenger && !isAssignedDriver;

    if (isPassengerOnly && !['CANCELLED'].includes(payload.status)) {
      throw new WsException(
        'Passengers can only cancel rides in realtime flow',
      );
    }

    const updateData: {
      status: TripStatus;
      pickupTime?: Date;
      dropoffTime?: Date;
      paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';
    } = {
      status: payload.status,
    };

    if (payload.status === 'IN_PROGRESS' && !trip.pickupTime) {
      updateData.pickupTime = new Date();
    }

    if (payload.status === 'COMPLETED') {
      updateData.dropoffTime = new Date();
      updateData.paymentStatus = 'PAID';
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: payload.rideId },
      data: updateData,
      include: {
        route: true,
        taxi: {
          include: {
            driver: true,
          },
        },
        vehicleTrip: {
          include: {
            passengers: true,
          },
        },
      },
    });

    return updatedTrip as RealtimeTripRecord;
  }
}
