import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
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
@ApiTags('Driver - Me')
@ApiBearerAuth('bearerAuth')
export class DriverMeController {
  constructor(private readonly meService: DriverMeService) {}

  @Get()
  @ApiOperation({
    summary: 'Get authenticated driver profile',
    description:
      'Returns driver profile, assignments, and status for the currently authenticated driver account.',
  })
  @ApiOkResponse({ description: 'Driver profile returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  async getDriverMe(@Req() req: AuthenticatedRequest): Promise<DriverMeDto> {
    const user = getAuthenticatedUser(req);
    return this.meService.getDriverMe(user);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update authenticated driver profile',
    description:
      'Updates mutable driver profile fields such as online status, contact info, and identity fields.',
  })
  @ApiOkResponse({ description: 'Driver profile updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
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
