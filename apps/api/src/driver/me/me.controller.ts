import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiAuthGuard } from '../common/api-auth.guard';
import type { AuthenticatedRequest } from '../common/api-auth.guard';
import { getAuthenticatedUser } from '../common/auth-user.util';
import { DriverMeService } from './me.service';

@Controller('api/driver/me')
@UseGuards(ApiAuthGuard)
export class DriverMeController {
  constructor(private readonly meService: DriverMeService) {}

  @Get()
  async getDriverMe(@Req() req: AuthenticatedRequest) {
    const user = getAuthenticatedUser(req);
    return this.meService.getDriverMe(user);
  }

  @Patch()
  async patchDriverMe(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      status?: string;
      isOnline?: boolean;
      phone?: string;
      email?: string;
      address?: string;
      firstName?: string;
      lastName?: string;
    },
  ) {
    const user = getAuthenticatedUser(req);
    return this.meService.patchDriverMe(user, body);
  }
}
