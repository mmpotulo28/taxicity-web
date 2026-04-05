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
import type { DriversListResponseDto, EntityDto } from '../common/user-api.dto';
import { UserDriversService } from './drivers.service';

@Controller('api/user/drivers')
@UseGuards(ApiAuthGuard)
export class UserDriversController {
  constructor(private readonly userDriversService: UserDriversService) {}

  @Get()
  listDrivers(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<DriversListResponseDto> {
    return this.userDriversService.listDrivers({ status, page, limit });
  }

  @Get(':id')
  getDriverById(@Param('id') id: string): Promise<EntityDto> {
    return this.userDriversService.getDriverById(id);
  }

  @Post()
  createDriver(
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userDriversService.createDriver(req, body);
  }

  @Put(':id')
  updateDriver(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userDriversService.updateDriver(req, id, body);
  }
}
