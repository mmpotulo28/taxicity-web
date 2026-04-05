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
import { ApiAuthGuard } from '../common/api-auth.guard';
import type { AuthenticatedRequest } from '../common/api-auth.guard';
import { getAuthenticatedUser } from '../common/auth-user.util';
import { DriverTripsService } from './trips.service';

@Controller('api/driver/trips')
@UseGuards(ApiAuthGuard)
export class DriverTripsController {
  constructor(private readonly tripsService: DriverTripsService) {}

  @Get('active')
  async getActiveTrips(@Req() req: AuthenticatedRequest) {
    const user = getAuthenticatedUser(req);
    return this.tripsService.getActiveTrips(user);
  }

  @Get('vehicle')
  async getVehicleTrips(@Req() req: AuthenticatedRequest): Promise<unknown> {
    const user = getAuthenticatedUser(req);
    const data = await this.tripsService.getVehicleTrips(user);
    return data as unknown;
  }

  @Post('vehicle')
  async createVehicleTrip(
    @Req() req: AuthenticatedRequest,
    @Body() body: { taxiId?: string; routeId?: string },
  ): Promise<unknown> {
    const user = getAuthenticatedUser(req);
    const data = await this.tripsService.createVehicleTrip(user, body);
    return data as unknown;
  }

  @Patch('vehicle/:id')
  async updateVehicleTrip(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { status?: string; manualPassengers?: number },
  ): Promise<unknown> {
    const user = getAuthenticatedUser(req);
    const data = await this.tripsService.updateVehicleTrip(user, id, body);
    return data as unknown;
  }

  @Post('vehicle/:id/passengers/:tripId/accept')
  async acceptPassenger(
    @Req() req: AuthenticatedRequest,
    @Param('id') vehicleTripId: string,
    @Param('tripId') passengerTripId: string,
  ): Promise<unknown> {
    const user = getAuthenticatedUser(req);
    const data = await this.tripsService.acceptPassenger(
      user,
      vehicleTripId,
      passengerTripId,
    );
    return data as unknown;
  }
}
