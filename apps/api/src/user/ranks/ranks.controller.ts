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
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ApiAuthGuard } from '../../driver/common/api-auth.guard';
import type {
  ApiMessageDto,
  EntityDto,
  RanksListResponseDto,
} from '../common/user-api.dto';
import { UserRanksService } from './ranks.service';

@Controller('api/user/ranks')
@ApiTags('User - Ranks')
export class UserRanksController {
  constructor(private readonly userRanksService: UserRanksService) {}

  @Get()
  @ApiOperation({
    summary: 'List ranks',
    description:
      'Returns ranks with optional filtering by region, city, activation state, and pagination.',
  })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
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
  @ApiParam({ name: 'id', description: 'Rank identifier' })
  @ApiOperation({
    summary: 'Get rank by id',
    description: 'Returns details for a specific taxi rank.',
  })
  getRankById(@Param('id') id: string): Promise<EntityDto> {
    return this.userRanksService.getRankById(id);
  }

  @Post()
  @UseGuards(ApiAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Create rank',
    description: 'Creates a new rank record for route and dispatch operations.',
  })
  createRank(
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userRanksService.createRank(req, body);
  }

  @Put(':id')
  @UseGuards(ApiAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiParam({ name: 'id', description: 'Rank identifier' })
  @ApiOperation({
    summary: 'Update rank',
    description: 'Updates an existing rank by id.',
  })
  updateRank(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userRanksService.updateRank(req, id, body);
  }

  @Delete(':id')
  @UseGuards(ApiAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiParam({ name: 'id', description: 'Rank identifier' })
  @ApiOperation({
    summary: 'Delete rank',
    description: 'Deletes a rank record by id for authorized workflows.',
  })
  deleteRank(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiMessageDto> {
    return this.userRanksService.deleteRank(req, id);
  }
}
