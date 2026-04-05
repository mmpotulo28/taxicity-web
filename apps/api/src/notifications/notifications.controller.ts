import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiAuthGuard } from '../driver/common/api-auth.guard';
import type { AuthenticatedRequest } from '../driver/common/api-auth.guard';
import { getAuthenticatedUser } from '../driver/common/auth-user.util';
import type {
  NotificationDto,
  SuccessResponseDto,
} from './dto/notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('api/notifications')
@UseGuards(ApiAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @Req() req: AuthenticatedRequest,
  ): Promise<NotificationDto[]> {
    const user = getAuthenticatedUser(req);
    return this.notificationsService.getNotifications(user.userId);
  }

  @Patch()
  async markAsRead(
    @Req() req: AuthenticatedRequest,
    @Body() body: { id?: string },
  ): Promise<SuccessResponseDto> {
    const user = getAuthenticatedUser(req);
    return this.notificationsService.markAsRead(user.userId, body.id);
  }
}
