import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiAuthGuard } from '../common/api-auth.guard';
import type { AuthenticatedRequest } from '../common/api-auth.guard';
import { getAuthenticatedUser } from '../common/auth-user.util';
import { DriverVehicleService } from './vehicle.service';

@Controller('api/driver/vehicle')
@UseGuards(ApiAuthGuard)
export class DriverVehicleController {
  constructor(private readonly vehicleService: DriverVehicleService) {}

  @Post()
  async createVehicle(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      plateNumber?: string;
      model?: string;
      make?: string;
      color?: string;
      seats?: string;
    },
  ) {
    const user = getAuthenticatedUser(req);
    return this.vehicleService.createVehicle(user, body);
  }

  @Post(':id/route')
  async updateVehicleRoute(
    @Req() req: AuthenticatedRequest,
    @Param('id') taxiId: string,
    @Body() body: { routeId?: string; permitDoc?: string },
  ) {
    const user = getAuthenticatedUser(req);
    return this.vehicleService.updateVehicleRoute(user, taxiId, body);
  }
}
