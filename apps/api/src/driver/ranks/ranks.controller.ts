import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiAuthGuard } from '../common/api-auth.guard';
import { DriverRanksService } from './ranks.service';

@Controller('api/ranks')
@UseGuards(ApiAuthGuard)
export class DriverRanksController {
  constructor(private readonly ranksService: DriverRanksService) {}

  @Get()
  async getRanks(
    @Query('region') region?: string,
    @Query('city') city?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ranksService.getRanks({ region, city, page, limit });
  }
}
