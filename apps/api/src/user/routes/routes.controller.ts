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
import type { Request } from 'express';
import { ApiAuthGuard } from '../../driver/common/api-auth.guard';
import type {
  ApiMessageDto,
  EntityDto,
  RoutesListResponseDto,
} from '../common/user-api.dto';
import { UserRoutesService } from './routes.service';

@Controller('api/user/routes')
export class UserRoutesController {
  constructor(private readonly userRoutesService: UserRoutesService) {}

  @Get()
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
  getRouteById(@Param('id') id: string): Promise<EntityDto> {
    return this.userRoutesService.getRouteById(id);
  }

  @Post()
  @UseGuards(ApiAuthGuard)
  createRoute(
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userRoutesService.createRoute(req, body);
  }

  @Put(':id')
  @UseGuards(ApiAuthGuard)
  updateRoute(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userRoutesService.updateRoute(req, id, body);
  }

  @Delete(':id')
  @UseGuards(ApiAuthGuard)
  deleteRoute(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiMessageDto> {
    return this.userRoutesService.deleteRoute(req, id);
  }
}
