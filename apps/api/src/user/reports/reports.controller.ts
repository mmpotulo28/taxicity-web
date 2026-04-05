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
import { ApiAuthGuard } from '../../driver/common/api-auth.guard';
import type { AuthenticatedRequest } from '../../driver/common/api-auth.guard';
import type {
  ApiMessageDto,
  EntityDto,
  ReportsListResponseDto,
} from '../common/user-api.dto';
import { UserReportsService } from './reports.service';

@Controller('api/user/reports')
@UseGuards(ApiAuthGuard)
export class UserReportsController {
  constructor(private readonly userReportsService: UserReportsService) {}

  @Get()
  listReports(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ReportsListResponseDto> {
    return this.userReportsService.listReports(req, { status, page, limit });
  }

  @Post()
  createReport(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userReportsService.createReport(req, body);
  }

  @Get(':id')
  getReportById(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<EntityDto> {
    return this.userReportsService.getReportById(req, id);
  }

  @Put(':id')
  updateReport(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userReportsService.updateReport(req, id, body);
  }

  @Delete(':id')
  deleteReport(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ApiMessageDto> {
    return this.userReportsService.deleteReport(req, id);
  }
}
