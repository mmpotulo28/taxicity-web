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
import type {
  AcceptedPassengerDto,
  ActiveTripsResponseDto,
  VehicleTripDto,
} from './dto/trips.dto';
import { DriverTripsService } from './trips.service';

@Controller('api/driver/trips')
@UseGuards(ApiAuthGuard)
export class DriverTripsController {
  constructor(private readonly tripsService: DriverTripsService) {}

  @Get('active')
  async getActiveTrips(
    @Req() req: AuthenticatedRequest,
  ): Promise<ActiveTripsResponseDto> {
    const user = getAuthenticatedUser(req);
    return this.tripsService.getActiveTrips(user);
  }

  @Get('vehicle')
  async getVehicleTrips(
    @Req() req: AuthenticatedRequest,
  ): Promise<VehicleTripDto[]> {
    const user = getAuthenticatedUser(req);
    return this.tripsService.getVehicleTrips(user);
  }

  @Post('vehicle')
  async createVehicleTrip(
    @Req() req: AuthenticatedRequest,
    @Body() body: { taxiId?: string; routeId?: string },
  ): Promise<VehicleTripDto> {
    const user = getAuthenticatedUser(req);
    return this.tripsService.createVehicleTrip(user, body);
  }

  @Patch('vehicle/:id')
  async updateVehicleTrip(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { status?: string; manualPassengers?: number },
  ): Promise<VehicleTripDto> {
    const user = getAuthenticatedUser(req);
    return this.tripsService.updateVehicleTrip(user, id, body);
  }

  @Post('vehicle/:id/passengers/:tripId/accept')
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
