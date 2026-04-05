import { Injectable } from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class RealtimeQueueService {
  async getQueueStatus(userId: string) {
    const driver = await prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) {
      throw new WsException('Driver profile not found');
    }

    const queueEntry = await prisma.rankQueueEntry.findUnique({
      where: { driverId: driver.id },
      include: {
        rank: {
          include: {
            sourceRoutes: true,
          },
        },
      },
    });

    if (!queueEntry) {
      return { inQueue: false };
    }

    const position = await prisma.rankQueueEntry.count({
      where: {
        rankId: queueEntry.rankId,
        joinedAt: {
          lt: queueEntry.joinedAt,
        },
      },
    });

    const queueLength = await prisma.rankQueueEntry.count({
      where: {
        rankId: queueEntry.rankId,
      },
    });

    return {
      inQueue: true,
      rank: {
        id: queueEntry.rankId,
        name: queueEntry.rank.name,
        sourceRoutes: queueEntry.rank.sourceRoutes,
      },
      position: position + 1,
      queueLength,
      joinedAt: queueEntry.joinedAt,
    };
  }

  async joinQueue(userId: string, payload: { rankId: string; taxiId: string }) {
    const driver = await prisma.driver.findUnique({
      where: { userId },
    });
    if (!driver) {
      throw new WsException('Driver profile not found');
    }

    const existing = await prisma.rankQueueEntry.findUnique({
      where: { driverId: driver.id },
    });
    if (existing) {
      throw new WsException('You are already in a queue. Leave first.');
    }

    const newEntry = await prisma.rankQueueEntry.create({
      data: {
        driverId: driver.id,
        rankId: payload.rankId,
        taxiId: payload.taxiId,
      },
      include: {
        rank: true,
      },
    });

    const position = await prisma.rankQueueEntry.count({
      where: {
        rankId: payload.rankId,
        joinedAt: {
          lt: newEntry.joinedAt,
        },
      },
    });

    return {
      success: true,
      rank: newEntry.rank.name,
      position: position + 1,
      joinedAt: newEntry.joinedAt,
    };
  }

  async leaveQueue(userId: string) {
    const driver = await prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) {
      throw new WsException('Driver not found');
    }

    await prisma.rankQueueEntry.delete({
      where: { driverId: driver.id },
    });

    return { success: true, message: 'Left queue' };
  }
}
