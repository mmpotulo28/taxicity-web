import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { AuthenticatedUser } from '../common/api-auth.guard';

@Injectable()
export class DriverEarningsService {
  private buildRecentTrip(
    vt: {
      id: string;
      startTime: Date | null;
      endTime: Date | null;
      createdAt: Date;
      route: { name: string } | null;
      passengers: Array<unknown>;
    },
    tripDate: Date,
    tripTotal: number,
  ) {
    return {
      id: vt.id,
      startTime: (vt.startTime || tripDate).toISOString(),
      endTime: (vt.endTime || tripDate).toISOString(),
      route: {
        name: vt.route?.name || 'Unknown Route',
      },
      fare: 0,
      passengers: vt.passengers.length,
      totalAmount: tripTotal,
    };
  }

  private applyPassengerStats(
    stats: {
      totalEarnings: number;
      todayEarnings: number;
      weekEarnings: number;
      monthEarnings: number;
      amountDue: number;
      tripTotal: number;
    },
    passenger: {
      fare: unknown;
      platformFee: unknown;
      platformFeeStatus: string | null;
    },
    tripDate: Date,
    buckets: { startOfDay: Date; startOfWeek: Date; startOfMonth: Date },
  ) {
    const fare = Number(passenger.fare);
    const fee = Number(passenger.platformFee || 0);

    stats.tripTotal += fare;
    stats.totalEarnings += fare;

    if (passenger.platformFeeStatus === 'PENDING') {
      stats.amountDue += fee;
    }

    if (tripDate >= buckets.startOfDay) stats.todayEarnings += fare;
    if (tripDate >= buckets.startOfWeek) stats.weekEarnings += fare;
    if (tripDate >= buckets.startOfMonth) stats.monthEarnings += fare;
  }

  private buildTimeBuckets() {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return { startOfDay, startOfWeek, startOfMonth };
  }

  private summarizeTrips(
    vehicleTrips: Array<{
      id: string;
      startTime: Date | null;
      endTime: Date | null;
      createdAt: Date;
      route: { name: string } | null;
      passengers: Array<{
        fare: unknown;
        platformFee: unknown;
        platformFeeStatus: string | null;
      }>;
    }>,
    buckets: { startOfDay: Date; startOfWeek: Date; startOfMonth: Date },
  ) {
    const stats = {
      totalEarnings: 0,
      todayEarnings: 0,
      weekEarnings: 0,
      monthEarnings: 0,
      amountDue: 0,
      tripTotal: 0,
    };
    const recentTrips: Array<Record<string, unknown>> = [];

    for (const vt of vehicleTrips) {
      const tripDate = vt.endTime || vt.createdAt;
      stats.tripTotal = 0;

      for (const p of vt.passengers) {
        this.applyPassengerStats(stats, p, tripDate, buckets);
      }

      if (recentTrips.length < 10) {
        recentTrips.push(this.buildRecentTrip(vt, tripDate, stats.tripTotal));
      }
    }

    return {
      total: stats.totalEarnings,
      today: stats.todayEarnings,
      week: stats.weekEarnings,
      month: stats.monthEarnings,
      amountDue: stats.amountDue,
      trips: recentTrips,
    };
  }

  async getDriverEarnings(user: AuthenticatedUser) {
    const driver = await prisma.driver.findUnique({
      where: { userId: user.userId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const vehicleTrips = await prisma.vehicleTrip.findMany({
      where: {
        driverId: driver.id,
        status: 'COMPLETED',
      },
      include: {
        passengers: {
          where: { status: 'COMPLETED' },
        },
        route: true,
      },
      orderBy: { endTime: 'desc' },
    });

    return this.summarizeTrips(vehicleTrips, this.buildTimeBuckets());
  }
}
