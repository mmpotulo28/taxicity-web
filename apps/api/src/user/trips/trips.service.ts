import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { AuthenticatedRequest } from '../../driver/common/api-auth.guard';
import type {
  EntityDto,
  TripsBoardRideResponseDto,
} from '../common/user-api.dto';
import { UserApiHelpers } from '../common/user-api.helpers';

@Injectable()
export class UserTripsService {
  constructor(private readonly userApiHelpers: UserApiHelpers) {}

  listOpenTrips(): Promise<EntityDto[]> {
    return prisma.trip.findMany({
      where: {
        status: {
          in: ['REQUESTED', 'ACCEPTED'],
        },
      },
      include: {
        route: true,
      },
      orderBy: { requestTime: 'desc' },
    });
  }

  listTrips(req: AuthenticatedRequest): Promise<EntityDto[]> {
    const userId = this.userApiHelpers.getUserId(req);

    return prisma.trip.findMany({
      where: { userId },
      orderBy: { requestTime: 'desc' },
      include: {
        route: true,
        taxi: {
          include: {
            driver: true,
          },
        },
        rank: true,
      },
    });
  }

  async getTrip(req: AuthenticatedRequest, id: string): Promise<EntityDto> {
    const userId = this.userApiHelpers.getUserId(req);

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        route: true,
        taxi: {
          include: {
            driver: true,
          },
        },
        vehicleTrip: {
          include: {
            passengers: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.userId !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    return trip;
  }

  submitTripRating(
    req: AuthenticatedRequest,
    id: string,
    body: Record<string, unknown>,
  ): Promise<EntityDto> {
    const userId = this.userApiHelpers.getUserId(req);
    const rating = Number(body.rating ?? Number.NaN);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException('Invalid data');
    }

    const comment = typeof body.comment === 'string' ? body.comment : undefined;

    return prisma.trip
      .findUnique({
        where: { id },
        include: {
          taxi: {
            include: {
              driver: true,
            },
          },
        },
      })
      .then(async (trip) => {
        if (!trip) {
          throw new NotFoundException('Trip not found');
        }

        if (trip.userId !== userId) {
          throw new ForbiddenException('Unauthorized to rate this trip');
        }

        if (trip.status !== 'COMPLETED') {
          throw new BadRequestException('Trip must be completed to rate');
        }

        if (!trip.taxi?.driver) {
          throw new BadRequestException('No driver found for this trip');
        }

        const existing = await prisma.tripRating.findUnique({
          where: { tripId: id },
        });

        if (existing) {
          throw new BadRequestException('Trip already rated');
        }

        return prisma.tripRating.create({
          data: {
            tripId: id,
            userId,
            driverId: trip.taxi.driver.id,
            rating,
            comment,
          },
        });
      });
  }

  boardRide(
    req: AuthenticatedRequest,
    body: Record<string, unknown>,
  ): Promise<TripsBoardRideResponseDto> {
    const userId = this.userApiHelpers.getUserId(req);
    const vehicleTripId = this.userApiHelpers.asString(body.vehicleTripId);

    if (!vehicleTripId) {
      throw new BadRequestException('vehicleTripId is required');
    }

    return prisma.vehicleTrip
      .findUnique({
        where: { id: vehicleTripId },
        include: {
          route: true,
        },
      })
      .then(async (vehicleTrip) => {
        if (!vehicleTrip) {
          throw new NotFoundException('Vehicle trip not found');
        }

        const pickupLat = Number(body.lat ?? Number.NaN);
        const pickupLng = Number(body.lng ?? Number.NaN);

        const trip = await prisma.trip.create({
          data: {
            userId,
            taxiId:
              typeof body.taxiId === 'string'
                ? body.taxiId
                : vehicleTrip.taxiId,
            routeId: vehicleTrip.routeId,
            rankId: vehicleTrip.route.sourceRankId,
            pickupAddress: 'Boarding location',
            pickupLat: Number.isFinite(pickupLat)
              ? pickupLat
              : vehicleTrip.route.distance,
            pickupLng: Number.isFinite(pickupLng)
              ? pickupLng
              : vehicleTrip.route.estimatedDuration,
            dropoffAddress: vehicleTrip.route.name,
            dropoffLat: Number.isFinite(pickupLat) ? pickupLat : 0,
            dropoffLng: Number.isFinite(pickupLng) ? pickupLng : 0,
            fare: vehicleTrip.route.baseFare,
            status: 'IN_PROGRESS',
            vehicleTripId: vehicleTrip.id,
            paymentMethod: 'CASH',
          },
          include: {
            route: true,
            taxi: true,
          },
        });

        return {
          message: 'Boarding successful',
          trip,
        };
      });
  }
}
