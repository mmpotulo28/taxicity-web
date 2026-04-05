import {
  Body,
  Controller,
  Delete,
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
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ApiAuthGuard } from '../../driver/common/api-auth.guard';
import type {
  ApiMessageDto,
  EntityDto,
  RoutesListResponseDto,
} from '../common/user-api.dto';
import { UserRoutesService } from './routes.service';

@Controller('api/user/routes')
@ApiTags('User - Routes')
export class UserRoutesController {
  constructor(private readonly userRoutesService: UserRoutesService) {}

  @Get()
  @ApiOperation({
    summary: 'List routes',
    description:
      'Returns paginated route listings with optional status/source/destination filters.',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'sourceRankId', required: false })
  @ApiQuery({ name: 'destRankId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ description: 'Routes returned successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
  listRoutes(
    @Query('status') status?: string,
    @Query('sourceRankId') sourceRankId?: string,
    @Query('destRankId') destRankId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<RoutesListResponseDto> {
    return this.userRoutesService.listRoutes({
      status,
      sourceRankId,
      destRankId,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Route identifier' })
  @ApiOperation({
    summary: 'Get route by id',
    description:
      'Returns route details including ranks and operational metadata.',
  })
  @ApiOkResponse({ description: 'Route returned successfully.' })
  @ApiNotFoundResponse({ description: 'Route not found.' })
  getRouteById(@Param('id') id: string): Promise<EntityDto> {
    return this.userRoutesService.getRouteById(id);
  }

  @Post()
  @UseGuards(ApiAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Create route',
    description:
      'Creates a new route. Intended for authorized administrative/operator workflows.',
  })
  @ApiCreatedResponse({ description: 'Route created successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  createRoute(
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userRoutesService.createRoute(req, body);
  }

  @Put(':id')
  @UseGuards(ApiAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiParam({ name: 'id', description: 'Route identifier' })
  @ApiOperation({
    summary: 'Update route',
    description: 'Updates route details for an existing route record.',
  })
  @ApiOkResponse({ description: 'Route updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Route not found.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  updateRoute(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userRoutesService.updateRoute(req, id, body);
  }

  @Delete(':id')
  @UseGuards(ApiAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiParam({ name: 'id', description: 'Route identifier' })
  @ApiOperation({
    summary: 'Delete route',
    description:
      'Deletes a route by id for authorized administrative workflows.',
  })
  @ApiOkResponse({ description: 'Route deleted successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Route not found.' })
  deleteRoute(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiMessageDto> {
    return this.userRoutesService.deleteRoute(req, id);
  }
}
