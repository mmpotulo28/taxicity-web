import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiAuthGuard } from '../../driver/common/api-auth.guard';
import type { AuthenticatedRequest } from '../../driver/common/api-auth.guard';
import type { SearchResponseDto } from '../common/user-api.dto';
import { UserSearchService } from './search.service';

@Controller('api/user/search')
@UseGuards(ApiAuthGuard)
export class UserSearchController {
  constructor(private readonly userSearchService: UserSearchService) {}

  @Get()
  search(
    @Req() req: AuthenticatedRequest,
    @Query('query') query?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<SearchResponseDto> {
    return this.userSearchService.search(req, { query, type, page, limit });
  }
}
