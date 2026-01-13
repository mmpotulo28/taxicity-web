import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { pusherServer } from '@taxicity/utils';
import { Prisma } from '@taxicity/database';

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.trip.findMany({
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

  async create(userId: string, dto: CreateTripDto) {
    const tripData: Prisma.TripUncheckedCreateInput = {
      routeId: dto.routeId,
      rankId: dto.rankId,
      pickupAddress: dto.pickupAddress,
      pickupLat: dto.pickupLat,
      pickupLng: dto.pickupLng,
      dropoffAddress: dto.dropoffAddress,
      dropoffLat: dto.dropoffLat,
      dropoffLng: dto.dropoffLng,
      fare: dto.fare,
      paymentMethod: dto.paymentMethod,
      userId,
      status: 'REQUESTED',
      paymentStatus: 'PENDING',
      taxiId: dto.taxiId || null,
    };

    const trip = await this.prisma.trip.create({
      data: tripData,
      include: {
        route: true,
      },
    });

    try {
      await pusherServer.trigger(`route-${trip.routeId}`, 'new-trip', trip);
    } catch (error) {
      this.logger.error('Pusher trigger failed:', error);
    }

    return trip;
  }
}
