import {
  Body,
  Controller,
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
  EntityDto,
  SupportTicketsListResponseDto,
} from '../common/user-api.dto';
import { UserSupportService } from './support.service';

@Controller('api/user/support')
@UseGuards(ApiAuthGuard)
@ApiTags('User - Support')
@ApiBearerAuth('bearerAuth')
export class UserSupportController {
  constructor(private readonly userSupportService: UserSupportService) {}

  @Get()
  @ApiOperation({
    summary: 'List support tickets',
    description:
      'Returns the authenticated user support tickets with optional filters and pagination.',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ description: 'Support tickets returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.' })
  listSupportTickets(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<SupportTicketsListResponseDto> {
    return this.userSupportService.listSupportTickets(req, {
      status,
      category,
      priority,
      page,
      limit,
    });
  }

  @Post()
  @ApiOperation({
    summary: 'Create support ticket',
    description: 'Creates a new support ticket for the authenticated user.',
  })
  @ApiCreatedResponse({ description: 'Support ticket created successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  createSupportTicket(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userSupportService.createSupportTicket(req, body);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Support ticket identifier' })
  @ApiOperation({
    summary: 'Get support ticket',
    description: 'Returns support ticket details for the authenticated user.',
  })
  @ApiOkResponse({ description: 'Support ticket returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Support ticket not found.' })
  getSupportTicket(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<EntityDto> {
    return this.userSupportService.getSupportTicket(req, id);
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'Support ticket identifier' })
  @ApiOperation({
    summary: 'Update support ticket',
    description: 'Updates a support ticket owned by the authenticated user.',
  })
  @ApiOkResponse({ description: 'Support ticket updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Support ticket not found.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  updateSupportTicket(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userSupportService.updateSupportTicket(req, id, body);
  }
}
