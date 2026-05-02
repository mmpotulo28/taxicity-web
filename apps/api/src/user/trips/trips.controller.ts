import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiAuthGuard } from '../../driver/common/api-auth.guard';
import type { AuthenticatedRequest } from '../../driver/common/api-auth.guard';
import type {
  EntityDto,
  TripsBoardRideResponseDto,
} from '../common/user-api.dto';
import { UserTripsService } from './trips.service';

@Controller('api/user')
@ApiTags('User - Trips')
export class UserTripsController {
  constructor(private readonly userTripsService: UserTripsService) {}

  @Get('trips/open')
  @ApiOperation({
    summary: 'List open trips',
    description:
      'Returns open trips that can be viewed without requiring user authentication.',
  })
  @ApiOkResponse({ description: 'Open trips returned successfully.' })
  listOpenTrips(): Promise<EntityDto[]> {
    return this.userTripsService.listOpenTrips();
  }

  @Get('trips')
  @UseGuards(ApiAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'List current user trips',
    description:
      'Returns trips for the authenticated user ordered by request time.',
  })
  @ApiOkResponse({ description: 'Trips returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  listTrips(@Req() req: AuthenticatedRequest): Promise<EntityDto[]> {
    return this.userTripsService.listTrips(req);
  }

  @Get('trips/:id')
  @UseGuards(ApiAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiParam({
    name: 'id',
    description: 'Trip identifier',
    example: 'trip_12345',
  })
  @ApiOperation({
    summary: 'Get trip by id',
    description:
      'Fetches a single trip for the authenticated user. Returns 404 when inaccessible or not found.',
  })
  @ApiOkResponse({ description: 'Trip returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Trip not found.' })
  getTrip(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<EntityDto> {
    return this.userTripsService.getTrip(req, id);
  }

  @Post('trips/:id/rating')
  @UseGuards(ApiAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiParam({
    name: 'id',
    description: 'Trip identifier to rate',
    example: 'trip_12345',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['rating'],
      properties: {
        rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
      },
    },
  })
  @ApiOperation({
    summary: 'Submit trip rating',
    description:
      'Creates or updates a 1-5 star rating for a completed trip owned by the authenticated user.',
  })
  @ApiOkResponse({ description: 'Trip rating submitted successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Trip not found.' })
  @ApiBadRequestResponse({ description: 'Invalid rating payload.' })
  submitTripRating(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userTripsService.submitTripRating(req, id, body);
  }

  @Post('ride/board')
  @UseGuards(ApiAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Board ride by QR payload',
    description:
      'Confirms passenger boarding using trip/vehicle verification payload from driver flow.',
  })
  @ApiOkResponse({ description: 'Ride boarding confirmed successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid boarding payload.' })
  @ApiNotFoundResponse({ description: 'Trip or vehicle trip not found.' })
  boardRide(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ): Promise<TripsBoardRideResponseDto> {
    return this.userTripsService.boardRide(req, body);
  }
}
