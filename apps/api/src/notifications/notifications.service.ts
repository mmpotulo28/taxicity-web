import { Injectable } from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type {
  NotificationDto,
  SuccessResponseDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  async getNotifications(userId: string): Promise<NotificationDto[]> {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ userId }, { userId: 'ALL' }],
      },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
      actionUrl: notification.actionUrl,
    }));
  }

  async markAsRead(userId: string, id?: string): Promise<SuccessResponseDto> {
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
