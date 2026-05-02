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
import type { DriversListResponseDto, EntityDto } from '../common/user-api.dto';
import { UserDriversService } from './drivers.service';

@Controller('api/user/drivers')
@UseGuards(ApiAuthGuard)
@ApiTags('User - Drivers')
@ApiBearerAuth('bearerAuth')
export class UserDriversController {
  constructor(private readonly userDriversService: UserDriversService) {}

  @Get()
  @ApiOperation({
    summary: 'List drivers',
    description: 'Returns drivers with optional status filter and pagination.',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ description: 'Drivers returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
  listDrivers(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<DriversListResponseDto> {
    return this.userDriversService.listDrivers({ status, page, limit });
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Driver identifier' })
  @ApiOperation({
    summary: 'Get driver by id',
    description: 'Returns the details of a specific driver.',
  })
  @ApiOkResponse({ description: 'Driver returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Driver not found.' })
  getDriverById(@Param('id') id: string): Promise<EntityDto> {
    return this.userDriversService.getDriverById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create driver',
    description: 'Creates a driver profile record.',
  })
  @ApiCreatedResponse({ description: 'Driver created successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  createDriver(
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userDriversService.createDriver(req, body);
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'Driver identifier' })
  @ApiOperation({
    summary: 'Update driver',
    description: 'Updates an existing driver profile by id.',
  })
  @ApiOkResponse({ description: 'Driver updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Driver not found.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  updateDriver(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userDriversService.updateDriver(req, id, body);
  }
}
