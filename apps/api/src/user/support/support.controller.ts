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
import { ApiAuthGuard } from '../../driver/common/api-auth.guard';
import type { AuthenticatedRequest } from '../../driver/common/api-auth.guard';
import type {
  EntityDto,
  SupportTicketsListResponseDto,
} from '../common/user-api.dto';
import { UserSupportService } from './support.service';

@Controller('api/user/support')
@UseGuards(ApiAuthGuard)
export class UserSupportController {
  constructor(private readonly userSupportService: UserSupportService) {}

  @Get()
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
  createSupportTicket(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userSupportService.createSupportTicket(req, body);
  }

  @Get(':id')
  getSupportTicket(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<EntityDto> {
    return this.userSupportService.getSupportTicket(req, id);
  }

  @Put(':id')
  updateSupportTicket(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userSupportService.updateSupportTicket(req, id, body);
  }
}
