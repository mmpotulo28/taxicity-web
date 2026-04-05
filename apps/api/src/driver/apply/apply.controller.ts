import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiAuthGuard } from '../common/api-auth.guard';
import type { AuthenticatedRequest } from '../common/api-auth.guard';
import { getAuthenticatedUser } from '../common/auth-user.util';
import { DriverApplyService } from './apply.service';

@Controller('api/driver/apply')
@UseGuards(ApiAuthGuard)
export class DriverApplyController {
  constructor(private readonly applyService: DriverApplyService) {}

  @Post()
  async submitDriverApplication(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const user = getAuthenticatedUser(req);
    return this.applyService.submitDriverApplication(user, body);
  }
}
