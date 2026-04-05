import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiAuthGuard } from '../common/api-auth.guard';
import { DriverRanksService } from './ranks.service';

@Controller('api/driver/ranks')
@UseGuards(ApiAuthGuard)
@ApiTags('Driver - Ranks')
@ApiBearerAuth('bearerAuth')
export class DriverRanksController {
  constructor(private readonly ranksService: DriverRanksService) {}

  @Get()
  @ApiOperation({
    summary: 'List ranks',
    description:
      'Returns ranks relevant to driver onboarding and route assignment.',
  })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ description: 'Ranks returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
  async getRanks(
    @Query('region') region?: string,
    @Query('city') city?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ranksService.getRanks({ region, city, page, limit });
  }
}
