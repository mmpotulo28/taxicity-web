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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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
@ApiTags('User - Reports')
@ApiBearerAuth('bearerAuth')
export class UserReportsController {
  constructor(private readonly userReportsService: UserReportsService) {}

  @Get()
  @ApiOperation({
    summary: 'List reports',
    description: 'Returns reports for the authenticated user with pagination.',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ description: 'Reports returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
  listReports(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ReportsListResponseDto> {
    return this.userReportsService.listReports(req, { status, page, limit });
  }

  @Post()
  @ApiOperation({
    summary: 'Create report',
    description: 'Creates a new report for the authenticated user.',
  })
  @ApiCreatedResponse({ description: 'Report created successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  createReport(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userReportsService.createReport(req, body);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Report identifier' })
  @ApiOperation({
    summary: 'Get report by id',
    description: 'Returns report details for a specific report id.',
  })
  @ApiOkResponse({ description: 'Report returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Report not found.' })
  getReportById(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<EntityDto> {
    return this.userReportsService.getReportById(req, id);
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'Report identifier' })
  @ApiOperation({
    summary: 'Update report',
    description: 'Updates an existing report by id.',
  })
  @ApiOkResponse({ description: 'Report updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Report not found.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  updateReport(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userReportsService.updateReport(req, id, body);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Report identifier' })
  @ApiOperation({
    summary: 'Delete report',
    description: 'Deletes a report by id for the authenticated user.',
  })
  @ApiOkResponse({ description: 'Report deleted successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Report not found.' })
  deleteReport(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ApiMessageDto> {
    return this.userReportsService.deleteReport(req, id);
  }
}
