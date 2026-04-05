import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiAuthGuard } from '../common/api-auth.guard';
import type { AuthenticatedRequest } from '../common/api-auth.guard';
import { getAuthenticatedUser } from '../common/auth-user.util';
import { DriverEarningsService } from './earnings.service';

@Controller('api/driver/earnings')
@UseGuards(ApiAuthGuard)
export class DriverEarningsController {
  constructor(private readonly earningsService: DriverEarningsService) {}

  @Get()
  async getDriverEarnings(@Req() req: AuthenticatedRequest) {
    const user = getAuthenticatedUser(req);
    return this.earningsService.getDriverEarnings(user);
  }
}
