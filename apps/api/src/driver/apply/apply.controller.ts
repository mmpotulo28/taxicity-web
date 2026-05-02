import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAuthGuard } from '../common/api-auth.guard';
import type { AuthenticatedRequest } from '../common/api-auth.guard';
import { getAuthenticatedUser } from '../common/auth-user.util';
import { DriverApplyService } from './apply.service';

@Controller('api/driver/apply')
@UseGuards(ApiAuthGuard)
@ApiTags('Driver - Application')
@ApiBearerAuth('bearerAuth')
export class DriverApplyController {
  constructor(private readonly applyService: DriverApplyService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit driver application',
    description:
      'Submits onboarding application details for the authenticated driver account.',
  })
  @ApiCreatedResponse({
    description: 'Driver application submitted successfully.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid application payload.' })
  async submitDriverApplication(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ) {
    const user = getAuthenticatedUser(req);
    return this.applyService.submitDriverApplication(user, body);
  }
}
