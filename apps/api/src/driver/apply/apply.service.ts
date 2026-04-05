import { BadRequestException, Injectable } from '@nestjs/common';
import { prisma } from '@taxiciti/database';
import type { AuthenticatedUser } from '../common/api-auth.guard';

@Injectable()
export class DriverApplyService {
  private getRequiredString(
    body: Record<string, unknown>,
    key: string,
  ): string {
    const value = body[key];
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`Missing required field: ${key}`);
    }
    return value;
  }

  private getRequiredNumber(
    body: Record<string, unknown>,
    key: string,
  ): number {
    const value = body[key];
    let parsed = Number.NaN;

    if (typeof value === 'number') {
      parsed = value;
    } else if (typeof value === 'string') {
      parsed = Number(value);
    }

    if (!Number.isFinite(parsed)) {
      throw new BadRequestException(`Invalid numeric field: ${key}`);
    }

    return parsed;
  }

  async submitDriverApplication(
    user: AuthenticatedUser,
    body: Record<string, unknown>,
  ) {
    const licenseNumber = this.getRequiredString(body, 'licenseNumber');
    const licenseExpiry = this.getRequiredString(body, 'licenseExpiry');
    const licenseImageFront = this.getRequiredString(body, 'licenseImageFront');
    const licenseImageBack = this.getRequiredString(body, 'licenseImageBack');
    const plateNumber = this.getRequiredString(body, 'plateNumber');
    const make = this.getRequiredString(body, 'make');
    const model = this.getRequiredString(body, 'model');
    const year = this.getRequiredNumber(body, 'year');
    const color = this.getRequiredString(body, 'color');
    const capacity = this.getRequiredNumber(body, 'capacity');
    const registrationDoc = this.getRequiredString(body, 'registrationDoc');
    const insuranceDoc = this.getRequiredString(body, 'insuranceDoc');
    const permitDoc = this.getRequiredString(body, 'permitDoc');
    const routeId = this.getRequiredString(body, 'routeId');

    const existingDriver = await prisma.driver.findUnique({
      where: { userId: user.userId },
    });

    if (existingDriver) {
      throw new BadRequestException('Driver application already exists');
    }

    return prisma.driver.create({
      data: {
        userId: user.userId,
        firstName: user.firstName || 'Driver',
        lastName: user.lastName || 'User',
        email: user.email || undefined,
        phone: user.phone || '',
        licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        licenseImageFront,
        licenseImageBack,
        status: 'PENDING_VERIFICATION',
        taxis: {
          create: {
            licensePlate: plateNumber,
            make,
            model,
            year,
            color,
            capacity,
            status: 'AVAILABLE',
            registrationDoc,
            insuranceDoc,
            permitDoc,
            routes: {
              create: {
                routeId,
                isActive: true,
              },
            },
          },
        },
      },
      include: {
        taxis: {
          include: {
            routes: true,
          },
        },
      },
    });
  }
}
