import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiAuthGuard } from '../common/api-auth.guard';
import type { AuthenticatedRequest } from '../common/api-auth.guard';
import { getAuthenticatedUser } from '../common/auth-user.util';
import type {
  DriverRouteAssignmentDto,
  DriverRoutesResponseDto,
} from './dto/routes.dto';
import { DriverRoutesService } from './routes.service';

@Controller('api/driver/routes')
@UseGuards(ApiAuthGuard)
@ApiTags('Driver - Routes')
@ApiBearerAuth('bearerAuth')
export class DriverRoutesController {
  constructor(private readonly routesService: DriverRoutesService) {}

  @Get()
  @ApiOperation({
    summary: 'List available routes',
    description: 'Returns routes for driver assignment with optional filters.',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'sourceRankId', required: false })
  @ApiQuery({ name: 'destRankId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ description: 'Routes returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
  async getRoutes(
    @Query('status') status?: string,
    @Query('sourceRankId') sourceRankId?: string,
    @Query('destRankId') destRankId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<DriverRoutesResponseDto> {
    return this.routesService.getRoutes({
      status,
      sourceRankId,
      destRankId,
      page,
      limit,
    });
  }

  @Post('assign')
  @ApiOperation({
    summary: 'Assign driver to route',
    description: 'Assigns the authenticated driver/taxi to a route.',
  })
  @ApiCreatedResponse({ description: 'Driver route assigned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid assignment payload.' })
  async assignDriverRoute(
    @Req() req: AuthenticatedRequest,
    @Body() body: { taxiId?: string; routeId?: string },
  ): Promise<DriverRouteAssignmentDto> {
    const user = getAuthenticatedUser(req);
    return this.routesService.assignDriverRoute(user, body);
  }
}
