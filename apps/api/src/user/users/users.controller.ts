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
  UserProfileResponseDto,
} from '../common/user-api.dto';
import { UserUsersService } from './users.service';

@Controller('api/user/users')
@UseGuards(ApiAuthGuard)
export class UserUsersController {
  constructor(private readonly userUsersService: UserUsersService) {}

  @Get('saved-locations')
  listSavedLocations(@Req() req: AuthenticatedRequest): Promise<EntityDto[]> {
    return this.userUsersService.listSavedLocations(req);
  }

  @Post('saved-locations')
  createSavedLocation(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userUsersService.createSavedLocation(req, body);
  }

  @Get('saved-locations/:id')
  getSavedLocation(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<EntityDto> {
    return this.userUsersService.getSavedLocation(req, id);
  }

  @Put('saved-locations/:id')
  updateSavedLocation(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userUsersService.updateSavedLocation(req, id, body);
  }

  @Delete('saved-locations/:id')
  deleteSavedLocation(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ApiMessageDto> {
    return this.userUsersService.deleteSavedLocation(req, id);
  }

  @Get()
  getUserProfile(
    @Req() req: AuthenticatedRequest,
    @Query('all') all?: string,
  ): Promise<UserProfileResponseDto | ApiMessageDto> {
    return this.userUsersService.getUserProfile(req, all);
  }

  @Put()
  updateUserProfile(@Req() req: AuthenticatedRequest): ApiMessageDto {
    return this.userUsersService.updateUserProfile(req);
  }

  @Delete()
  deleteUserProfile(@Req() req: AuthenticatedRequest): Promise<ApiMessageDto> {
    return this.userUsersService.deleteUserProfile(req);
  }

  @Get('location')
  getUserLocation(@Req() req: AuthenticatedRequest): Promise<EntityDto | null> {
    return this.userUsersService.getUserLocation(req);
  }

  @Put('location')
  updateUserLocation(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userUsersService.updateUserLocation(req, body);
  }
}
