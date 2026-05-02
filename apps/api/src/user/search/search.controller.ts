import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiAuthGuard } from '../../driver/common/api-auth.guard';
import type { AuthenticatedRequest } from '../../driver/common/api-auth.guard';
import type { SearchResponseDto } from '../common/user-api.dto';
import { UserSearchService } from './search.service';

@Controller('api/user/search')
@UseGuards(ApiAuthGuard)
@ApiTags('User - Search')
@ApiBearerAuth('bearerAuth')
export class UserSearchController {
  constructor(private readonly userSearchService: UserSearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Search across user resources',
    description:
      'Runs keyword search across supported domain resources with optional type and pagination filters.',
  })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ description: 'Search results returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
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
