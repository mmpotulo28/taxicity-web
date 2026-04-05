import { Injectable } from '@nestjs/common';
import { prisma } from '@taxiciti/database';

@Injectable()
export class NotificationsService {
  async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: {
        OR: [{ userId }, { userId: 'ALL' }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(userId: string, id?: string) {
    if (id) {
      await prisma.notification.updateMany({
        where: {
          id,
          OR: [{ userId }, { userId: 'ALL' }],
        },
        data: { isRead: true },
      });
      return { success: true };
    }

    await prisma.notification.updateMany({
      where: {
        OR: [{ userId }, { userId: 'ALL' }],
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }
}
