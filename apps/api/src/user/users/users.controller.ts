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
  ApiOperation,
  ApiOkResponse,
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
  UserProfileResponseDto,
} from '../common/user-api.dto';
import { UserUsersService } from './users.service';

@Controller('api/user/users')
@UseGuards(ApiAuthGuard)
@ApiTags('User - Profile')
@ApiBearerAuth('bearerAuth')
export class UserUsersController {
  constructor(private readonly userUsersService: UserUsersService) {}

  @Get('saved-locations')
  @ApiOperation({
    summary: 'List saved locations',
    description: 'Returns all saved locations for the authenticated user.',
  })
  @ApiOkResponse({ description: 'Saved locations returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  listSavedLocations(@Req() req: AuthenticatedRequest): Promise<EntityDto[]> {
    return this.userUsersService.listSavedLocations(req);
  }

  @Post('saved-locations')
  @ApiOperation({
    summary: 'Create saved location',
    description: 'Creates a saved location for the authenticated user.',
  })
  @ApiCreatedResponse({ description: 'Saved location created successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  createSavedLocation(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userUsersService.createSavedLocation(req, body);
  }

  @Get('saved-locations/:id')
  @ApiParam({ name: 'id', description: 'Saved location identifier' })
  @ApiOperation({
    summary: 'Get saved location',
    description: 'Returns a saved location by id for the authenticated user.',
  })
  @ApiOkResponse({ description: 'Saved location returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Saved location not found.' })
  getSavedLocation(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<EntityDto> {
    return this.userUsersService.getSavedLocation(req, id);
  }

  @Put('saved-locations/:id')
  @ApiParam({ name: 'id', description: 'Saved location identifier' })
  @ApiOperation({
    summary: 'Update saved location',
    description: 'Updates a saved location by id for the authenticated user.',
  })
  @ApiOkResponse({ description: 'Saved location updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Saved location not found.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  updateSavedLocation(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userUsersService.updateSavedLocation(req, id, body);
  }

  @Delete('saved-locations/:id')
  @ApiParam({ name: 'id', description: 'Saved location identifier' })
  @ApiOperation({
    summary: 'Delete saved location',
    description: 'Deletes a saved location by id for the authenticated user.',
  })
  @ApiOkResponse({ description: 'Saved location deleted successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiNotFoundResponse({ description: 'Saved location not found.' })
  deleteSavedLocation(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ApiMessageDto> {
    return this.userUsersService.deleteSavedLocation(req, id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get user profile',
    description:
      'Returns the authenticated user profile and related account data.',
  })
  @ApiQuery({ name: 'all', required: false })
  @ApiOkResponse({ description: 'User profile returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  getUserProfile(
    @Req() req: AuthenticatedRequest,
    @Query('all') all?: string,
  ): Promise<UserProfileResponseDto | ApiMessageDto> {
    return this.userUsersService.getUserProfile(req, all);
  }

  @Put()
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Updates profile details for the authenticated user.',
  })
  @ApiOkResponse({ description: 'User profile update accepted.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  updateUserProfile(@Req() req: AuthenticatedRequest): ApiMessageDto {
    return this.userUsersService.updateUserProfile(req);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete user profile',
    description: 'Deletes/deactivates the authenticated user profile.',
  })
  @ApiOkResponse({ description: 'User profile deleted/deactivated.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  deleteUserProfile(@Req() req: AuthenticatedRequest): Promise<ApiMessageDto> {
    return this.userUsersService.deleteUserProfile(req);
  }

  @Get('location')
  @ApiOperation({
    summary: 'Get current user location',
    description:
      'Returns the latest location associated with the authenticated user.',
  })
  @ApiOkResponse({ description: 'User location returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  getUserLocation(@Req() req: AuthenticatedRequest): Promise<EntityDto | null> {
    return this.userUsersService.getUserLocation(req);
  }

  @Put('location')
  @ApiOperation({
    summary: 'Update current user location',
    description: 'Updates the authenticated user location information.',
  })
  @ApiOkResponse({ description: 'User location updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  updateUserLocation(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ): Promise<EntityDto> {
    return this.userUsersService.updateUserLocation(req, body);
  }
}
