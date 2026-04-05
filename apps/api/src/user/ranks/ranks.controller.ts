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
  RanksListResponseDto,
} from '../common/user-api.dto';
import { UserRanksService } from './ranks.service';

@Controller('api/user/ranks')
export class UserRanksController {
  constructor(private readonly userRanksService: UserRanksService) {}

  @Get()
  listRanks(
    @Query('region') region?: string,
    @Query('city') city?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<RanksListResponseDto> {
    return this.userRanksService.listRanks({
      region,
      city,
      isActive,
      page,
      limit,
    });
  }

  @Get(':id')
  getRankById(@Param('id') id: string): Promise<EntityDto> {
    return this.userRanksService.getRankById(id);
  }

  @Post()
  @UseGuards(ApiAuthGuard)
  createRank(
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userRanksService.createRank(req, body);
  }

  @Put(':id')
  @UseGuards(ApiAuthGuard)
  updateRank(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userRanksService.updateRank(req, id, body);
  }

  @Delete(':id')
  @UseGuards(ApiAuthGuard)
  deleteRank(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiMessageDto> {
    return this.userRanksService.deleteRank(req, id);
  }
}
