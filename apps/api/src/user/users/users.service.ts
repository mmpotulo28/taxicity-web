import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { AuthenticatedRequest } from '../../driver/common/api-auth.guard';
import type {
  ApiMessageDto,
  EntityDto,
  UserProfileResponseDto,
} from '../common/user-api.dto';
import { UserApiHelpers } from '../common/user-api.helpers';

@Injectable()
export class UserUsersService {
  constructor(private readonly userApiHelpers: UserApiHelpers) {}

  listSavedLocations(req: AuthenticatedRequest): Promise<EntityDto[]> {
    const userId = this.userApiHelpers.getUserId(req);
    return prisma.savedLocation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  createSavedLocation(
    req: AuthenticatedRequest,
    body: Record<string, unknown>,
  ): Promise<EntityDto> {
    const userId = this.userApiHelpers.getUserId(req);
    return prisma.savedLocation.create({
      data: {
        userId,
        name: this.userApiHelpers.asString(body.name),
        address: this.userApiHelpers.asString(body.address),
        lat: Number(body.lat ?? 0),
        lng: Number(body.lng ?? 0),
        type: this.userApiHelpers.asString(body.type),
      },
    });
  }

  async getSavedLocation(
    req: AuthenticatedRequest,
    id: string,
  ): Promise<EntityDto> {
    const userId = this.userApiHelpers.getUserId(req);

    const location = await prisma.savedLocation.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  updateSavedLocation(
    req: AuthenticatedRequest,
    id: string,
    body: Record<string, unknown>,
  ): Promise<EntityDto> {
    const userId = this.userApiHelpers.getUserId(req);

    return prisma.savedLocation
      .findFirst({
        where: {
          id,
          userId,
        },
      })
      .then(async (existing) => {
        if (!existing) {
          throw new NotFoundException('Location not found');
        }

        return prisma.savedLocation.update({
          where: { id },
          data: {
            name: typeof body.name === 'string' ? body.name : undefined,
            address:
              typeof body.address === 'string' ? body.address : undefined,
            lat: body.lat === undefined ? undefined : Number(body.lat),
            lng: body.lng === undefined ? undefined : Number(body.lng),
            type: typeof body.type === 'string' ? body.type : undefined,
          },
        });
      });
  }

  async deleteSavedLocation(
    req: AuthenticatedRequest,
    id: string,
  ): Promise<ApiMessageDto> {
    const userId = this.userApiHelpers.getUserId(req);
    const existing = await prisma.savedLocation.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Location not found');
    }

    await prisma.savedLocation.delete({ where: { id } });
    return { message: 'Location deleted successfully' };
  }

  getUserProfile(
    req: AuthenticatedRequest,
    all?: string,
  ): Promise<UserProfileResponseDto | ApiMessageDto> {
    const userId = this.userApiHelpers.getUserId(req);

    if (all === 'true') {
      return Promise.resolve({
        message:
          'User listing now belongs to auth provider. Query users there or add a user-profile mirror service.',
      });
    }

    return Promise.all([
      prisma.savedLocation.findMany({ where: { userId } }),
      prisma.emergencyContact.findMany({ where: { userId } }),
      prisma.userLocation.findUnique({ where: { userId } }),
      prisma.trip.count({ where: { userId } }),
      prisma.tripRating.count({ where: { userId } }),
      prisma.favoriteDriver.count({ where: { userId } }),
    ]).then(
      ([
        savedLocations,
        emergencyContacts,
        lastKnownLocation,
        tripCount,
        ratingCount,
        favDriverCount,
      ]) => ({
        id: userId,
        savedLocations,
        emergencyContacts,
        lastKnownLocation,
        _count: {
          trips: tripCount,
          tripRatings: ratingCount,
          favoriteDrivers: favDriverCount,
        },
      }),
    );
  }

  updateUserProfile(req: AuthenticatedRequest): ApiMessageDto {
    this.userApiHelpers.getUserId(req);
    return {
      message:
        'User profile writes are managed by Clerk. Keep using Clerk SDK for updates.',
    };
  }

  deleteUserProfile(req: AuthenticatedRequest): Promise<ApiMessageDto> {
    const userId = this.userApiHelpers.getUserId(req);

    return Promise.all([
      prisma.savedLocation.deleteMany({ where: { userId } }),
      prisma.emergencyContact.deleteMany({ where: { userId } }),
      prisma.userLocation.deleteMany({ where: { userId } }),
      prisma.routePreference.deleteMany({ where: { userId } }),
      prisma.favoriteDriver.deleteMany({ where: { userId } }),
    ]).then(() => ({ message: 'User data deleted successfully' }));
  }

  getUserLocation(req: AuthenticatedRequest): Promise<EntityDto | null> {
    const userId = this.userApiHelpers.getUserId(req);
    return prisma.userLocation.findUnique({ where: { userId } });
  }

  updateUserLocation(
    req: AuthenticatedRequest,
    body: Record<string, unknown>,
  ): Promise<EntityDto> {
    const userId = this.userApiHelpers.getUserId(req);
    const lat = Number(body.lat ?? Number.NaN);
    const lng = Number(body.lng ?? Number.NaN);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new BadRequestException('Invalid data');
    }

    const accuracy =
      body.accuracy === undefined ? undefined : Number(body.accuracy as number);

    return prisma.userLocation.upsert({
      where: { userId },
      update: {
        lat,
        lng,
        accuracy,
      },
      create: {
        userId,
        lat,
        lng,
        accuracy,
      },
    });
  }
}
