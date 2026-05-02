import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiAuthGuard } from '../common/api-auth.guard';
import type { AuthenticatedRequest } from '../common/api-auth.guard';
import { getAuthenticatedUser } from '../common/auth-user.util';
import { DriverVehicleService } from './vehicle.service';

@Controller('api/driver/vehicle')
@UseGuards(ApiAuthGuard)
@ApiTags('Driver - Vehicle')
@ApiBearerAuth('bearerAuth')
export class DriverVehicleController {
  constructor(private readonly vehicleService: DriverVehicleService) {}

  @Post()
  @ApiOperation({
    summary: 'Create vehicle profile',
    description:
      'Creates or registers the authenticated driver vehicle details required for operations.',
  })
  @ApiCreatedResponse({ description: 'Vehicle profile created successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid vehicle payload.' })
  async createVehicle(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      plateNumber?: string;
      model?: string;
      make?: string;
      color?: string;
      seats?: string;
    },
  ) {
    const user = getAuthenticatedUser(req);
    return this.vehicleService.createVehicle(user, body);
  }

  @Post(':id/route')
  @ApiParam({ name: 'id', description: 'Taxi identifier' })
  @ApiOperation({
    summary: 'Update vehicle route',
    description: 'Assigns or updates a route for a specific taxi/vehicle.',
  })
  @ApiOkResponse({ description: 'Vehicle route updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Taxi/vehicle not found.' })
  @ApiBadRequestResponse({ description: 'Invalid route assignment payload.' })
  async updateVehicleRoute(
    @Req() req: AuthenticatedRequest,
    @Param('id') taxiId: string,
    @Body() body: { routeId?: string; permitDoc?: string },
  ) {
    const user = getAuthenticatedUser(req);
    return this.vehicleService.updateVehicleRoute(user, taxiId, body);
  }
}
