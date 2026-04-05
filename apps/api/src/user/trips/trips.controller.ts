import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiAuthGuard } from '../../driver/common/api-auth.guard';
import type { AuthenticatedRequest } from '../../driver/common/api-auth.guard';
import type {
  EntityDto,
  TripsBoardRideResponseDto,
} from '../common/user-api.dto';
import { UserTripsService } from './trips.service';

@Controller('api/user')
export class UserTripsController {
  constructor(private readonly userTripsService: UserTripsService) {}

  @Get('trips/open')
  listOpenTrips(): Promise<EntityDto[]> {
    return this.userTripsService.listOpenTrips();
  }

  @Get('trips')
  @UseGuards(ApiAuthGuard)
  listTrips(@Req() req: AuthenticatedRequest): Promise<EntityDto[]> {
    return this.userTripsService.listTrips(req);
  }

  @Get('trips/:id')
  @UseGuards(ApiAuthGuard)
  getTrip(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<EntityDto> {
    return this.userTripsService.getTrip(req, id);
  }

  @Post('trips/:id/rating')
  @UseGuards(ApiAuthGuard)
  submitTripRating(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userTripsService.submitTripRating(req, id, body);
  }

  @Post('ride/board')
  @UseGuards(ApiAuthGuard)
  boardRide(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ): Promise<TripsBoardRideResponseDto> {
    return this.userTripsService.boardRide(req, body);
  }
}
