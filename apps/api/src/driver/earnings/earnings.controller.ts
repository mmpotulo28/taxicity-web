import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAuthGuard } from '../common/api-auth.guard';
import type { AuthenticatedRequest } from '../common/api-auth.guard';
import { getAuthenticatedUser } from '../common/auth-user.util';
import { DriverEarningsService } from './earnings.service';

@Controller('api/driver/earnings')
@UseGuards(ApiAuthGuard)
@ApiTags('Driver - Earnings')
@ApiBearerAuth('bearerAuth')
export class DriverEarningsController {
  constructor(private readonly earningsService: DriverEarningsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get driver earnings',
    description:
      'Returns earnings summary and related payout data for the driver.',
  })
  @ApiOkResponse({ description: 'Driver earnings returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  async getDriverEarnings(@Req() req: AuthenticatedRequest) {
    const user = getAuthenticatedUser(req);
    return this.earningsService.getDriverEarnings(user);
  }
}
