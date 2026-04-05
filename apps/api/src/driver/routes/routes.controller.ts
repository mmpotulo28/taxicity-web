import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiAuthGuard } from '../common/api-auth.guard';
import type { AuthenticatedRequest } from '../common/api-auth.guard';
import { getAuthenticatedUser } from '../common/auth-user.util';
import { DriverRoutesService } from './routes.service';

@Controller('api')
@UseGuards(ApiAuthGuard)
export class DriverRoutesController {
  constructor(private readonly routesService: DriverRoutesService) {}

  @Get('routes')
  async getRoutes(
    @Query('status') status?: string,
    @Query('sourceRankId') sourceRankId?: string,
    @Query('destRankId') destRankId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.routesService.getRoutes({
      status,
      sourceRankId,
      destRankId,
      page,
      limit,
    });
  }

  @Post('driver/routes/assign')
  async assignDriverRoute(
    @Req() req: AuthenticatedRequest,
    @Body() body: { taxiId?: string; routeId?: string },
  ) {
    const user = getAuthenticatedUser(req);
    return this.routesService.assignDriverRoute(user, body);
  }
}
