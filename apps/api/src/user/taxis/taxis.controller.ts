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
export class UserTaxisController {
  constructor(private readonly userTaxisService: UserTaxisService) {}

  @Get()
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
  getTaxiById(@Param('id') id: string): Promise<EntityDto> {
    return this.userTaxisService.getTaxiById(id);
  }

  @Post()
  @UseGuards(ApiAuthGuard)
  createTaxi(
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userTaxisService.createTaxi(req, body);
  }

  @Put(':id')
  @UseGuards(ApiAuthGuard)
  updateTaxi(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userTaxisService.updateTaxi(req, id, body);
  }

  @Get(':id/location')
  getTaxiLocation(@Param('id') id: string): Promise<EntityDto> {
    return this.userTaxisService.getTaxiLocation(id);
  }

  @Put(':id/location')
  @UseGuards(ApiAuthGuard)
  updateTaxiLocation(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userTaxisService.updateTaxiLocation(req, id, body);
  }

  @Get(':id/location/history')
  taxiLocationHistory(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<TaxiLocationHistoryResponseDto> {
    return this.userTaxisService.taxiLocationHistory(id, { page, limit });
  }
}
