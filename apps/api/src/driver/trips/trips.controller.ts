import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
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
import type {
  AcceptedPassengerDto,
  ActiveTripsResponseDto,
  VehicleTripDto,
} from './dto/trips.dto';
import { DriverTripsService } from './trips.service';

@Controller('api/driver/trips')
@UseGuards(ApiAuthGuard)
@ApiTags('Driver - Trips')
@ApiBearerAuth('bearerAuth')
export class DriverTripsController {
  constructor(private readonly tripsService: DriverTripsService) {}

  @Get('active')
  @ApiOperation({
    summary: 'Get active passenger trips',
    description:
      'Returns active passenger trips for taxis assigned to the authenticated driver.',
  })
  @ApiOkResponse({ description: 'Active trips returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  async getActiveTrips(
    @Req() req: AuthenticatedRequest,
  ): Promise<ActiveTripsResponseDto> {
    const user = getAuthenticatedUser(req);
    return this.tripsService.getActiveTrips(user);
  }

  @Get('vehicle')
  @ApiOperation({
    summary: 'Get vehicle trips',
    description:
      'Returns active/scheduled vehicle trips the authenticated driver is currently running.',
  })
  @ApiOkResponse({ description: 'Vehicle trips returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  async getVehicleTrips(
    @Req() req: AuthenticatedRequest,
  ): Promise<VehicleTripDto[]> {
    const user = getAuthenticatedUser(req);
    return this.tripsService.getVehicleTrips(user);
  }

  @Post('vehicle')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['taxiId', 'routeId'],
      properties: {
        taxiId: { type: 'string', example: 'taxi_123' },
        routeId: { type: 'string', example: 'route_123' },
      },
    },
  })
  @ApiOperation({
    summary: 'Create vehicle trip',
    description:
      'Starts a new driver vehicle trip for a taxi and route. Fails if taxi already has an active trip.',
  })
  @ApiCreatedResponse({ description: 'Vehicle trip created successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid vehicle trip payload.' })
  async createVehicleTrip(
    @Req() req: AuthenticatedRequest,
    @Body() body: { taxiId?: string; routeId?: string },
  ): Promise<VehicleTripDto> {
    const user = getAuthenticatedUser(req);
    return this.tripsService.createVehicleTrip(user, body);
  }

  @Patch('vehicle/:id')
  @ApiParam({ name: 'id', description: 'Vehicle trip identifier' })
  @ApiOperation({
    summary: 'Update vehicle trip',
    description:
      'Updates vehicle trip lifecycle status or manual passenger count for the authenticated driver.',
  })
  @ApiOkResponse({ description: 'Vehicle trip updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Vehicle trip not found.' })
  @ApiBadRequestResponse({ description: 'Invalid update payload.' })
  async updateVehicleTrip(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { status?: string; manualPassengers?: number },
  ): Promise<VehicleTripDto> {
    const user = getAuthenticatedUser(req);
    return this.tripsService.updateVehicleTrip(user, id, body);
  }

  @Post('vehicle/:id/passengers/:tripId/accept')
  @ApiParam({ name: 'id', description: 'Vehicle trip identifier' })
  @ApiParam({
    name: 'tripId',
    description: 'Passenger trip identifier to accept',
  })
  @ApiOperation({
    summary: 'Accept passenger into vehicle trip',
    description:
      'Moves a passenger trip into the driver vehicle trip manifest and returns accepted passenger data.',
  })
  @ApiOkResponse({ description: 'Passenger accepted successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({
    description: 'Vehicle trip or passenger trip not found.',
  })
  @ApiBadRequestResponse({
    description: 'Passenger cannot be accepted in current state.',
  })
  async acceptPassenger(
    @Req() req: AuthenticatedRequest,
    @Param('id') vehicleTripId: string,
    @Param('tripId') passengerTripId: string,
  ): Promise<AcceptedPassengerDto> {
    const user = getAuthenticatedUser(req);
    return this.tripsService.acceptPassenger(
      user,
      vehicleTripId,
      passengerTripId,
    );
  }
}
