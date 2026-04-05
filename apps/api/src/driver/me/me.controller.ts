import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiAuthGuard } from '../common/api-auth.guard';
import type { AuthenticatedRequest } from '../common/api-auth.guard';
import { getAuthenticatedUser } from '../common/auth-user.util';
import type { DriverMeDto } from './dto/me.dto';
import { DriverMeService } from './me.service';

type DriverStatusInput =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'PENDING_VERIFICATION';

@Controller('api/driver/me')
@UseGuards(ApiAuthGuard)
export class DriverMeController {
  constructor(private readonly meService: DriverMeService) {}

  @Get()
  async getDriverMe(@Req() req: AuthenticatedRequest): Promise<DriverMeDto> {
    const user = getAuthenticatedUser(req);
    return this.meService.getDriverMe(user);
  }

  @Patch()
  async patchDriverMe(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      status?: DriverStatusInput;
      isOnline?: boolean;
      phone?: string;
      email?: string;
      address?: string;
      firstName?: string;
      lastName?: string;
    },
  ): Promise<DriverMeDto> {
    const user = getAuthenticatedUser(req);
    return this.meService.patchDriverMe(user, body);
  }
}
