import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ApiAuthGuard } from '../../driver/common/api-auth.guard';
import type { AuthenticatedRequest } from '../../driver/common/api-auth.guard';
import type {
  EntityDto,
  TaxiLocationHistoryResponseDto,
  TaxisListResponseDto,
} from '../common/user-api.dto';
import { UserTaxisService } from './taxis.service';

@Controller('api/user/taxis')
@ApiTags('User - Taxis')
export class UserTaxisController {
  constructor(private readonly userTaxisService: UserTaxisService) {}

  @Get()
  @ApiOperation({
    summary: 'List taxis',
    description:
      'Returns taxis with optional filters for status, route, rank, driver, availability, and pagination.',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'routeId', required: false })
  @ApiQuery({ name: 'rankId', required: false })
  @ApiQuery({ name: 'driverId', required: false })
  @ApiQuery({ name: 'available', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ description: 'Taxis returned successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
  listTaxis(
    @Query('status') status?: string,
    @Query('routeId') routeId?: string,
    @Query('rankId') rankId?: string,
    @Query('driverId') driverId?: string,
    @Query('available') available?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<TaxisListResponseDto> {
    return this.userTaxisService.listTaxis({
      status,
      routeId,
      rankId,
      driverId,
      available,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Taxi identifier' })
  @ApiOperation({
    summary: 'Get taxi by id',
    description: 'Returns taxi details for a specific taxi id.',
  })
  @ApiOkResponse({ description: 'Taxi returned successfully.' })
  @ApiNotFoundResponse({ description: 'Taxi not found.' })
  getTaxiById(@Param('id') id: string): Promise<EntityDto> {
    return this.userTaxisService.getTaxiById(id);
  }

  @Post()
  @UseGuards(ApiAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Create taxi',
    description: 'Creates a taxi record for fleet operations.',
  })
  @ApiCreatedResponse({ description: 'Taxi created successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  createTaxi(
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userTaxisService.createTaxi(req, body);
  }

  @Put(':id')
  @UseGuards(ApiAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiParam({ name: 'id', description: 'Taxi identifier' })
  @ApiOperation({
    summary: 'Update taxi',
    description: 'Updates taxi details by id.',
  })
  @ApiOkResponse({ description: 'Taxi updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Taxi not found.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  updateTaxi(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userTaxisService.updateTaxi(req, id, body);
  }

  @Get(':id/location')
  @ApiParam({ name: 'id', description: 'Taxi identifier' })
  @ApiOperation({
    summary: 'Get taxi location',
    description: 'Returns the latest known location for a taxi.',
  })
  @ApiOkResponse({ description: 'Taxi location returned successfully.' })
  @ApiNotFoundResponse({ description: 'Taxi not found.' })
  getTaxiLocation(@Param('id') id: string): Promise<EntityDto> {
    return this.userTaxisService.getTaxiLocation(id);
  }

  @Put(':id/location')
  @UseGuards(ApiAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiParam({ name: 'id', description: 'Taxi identifier' })
  @ApiOperation({
    summary: 'Update taxi location',
    description:
      'Updates the active taxi location. Intended for authenticated taxi/driver updates.',
  })
  @ApiOkResponse({ description: 'Taxi location updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Taxi not found.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  updateTaxiLocation(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userTaxisService.updateTaxiLocation(req, id, body);
  }

  @Get(':id/location/history')
  @ApiParam({ name: 'id', description: 'Taxi identifier' })
  @ApiOperation({
    summary: 'Get taxi location history',
    description: 'Returns paginated historical location points for a taxi.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({
    description: 'Taxi location history returned successfully.',
  })
  @ApiNotFoundResponse({ description: 'Taxi not found.' })
  taxiLocationHistory(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<TaxiLocationHistoryResponseDto> {
    return this.userTaxisService.taxiLocationHistory(id, { page, limit });
  }
}
