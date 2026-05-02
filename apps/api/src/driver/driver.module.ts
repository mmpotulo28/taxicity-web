import { Module } from '@nestjs/common';
import { DriverApplyController } from './apply/apply.controller';
import { DriverApplyService } from './apply/apply.service';
import { ApiAuthGuard } from './common/api-auth.guard';
import { DriverEarningsController } from './earnings/earnings.controller';
import { DriverEarningsService } from './earnings/earnings.service';
import { DriverMeController } from './me/me.controller';
import { DriverMeService } from './me/me.service';
import { DriverRanksController } from './ranks/ranks.controller';
import { DriverRanksService } from './ranks/ranks.service';
import { DriverRoutesController } from './routes/routes.controller';
import { DriverRoutesService } from './routes/routes.service';
import { DriverTripsController } from './trips/trips.controller';
import { DriverTripsService } from './trips/trips.service';
import { DriverVehicleController } from './vehicle/vehicle.controller';
import { DriverVehicleService } from './vehicle/vehicle.service';

@Module({
  controllers: [
    DriverMeController,
    DriverApplyController,
    DriverEarningsController,
    DriverRanksController,
    DriverRoutesController,
    DriverTripsController,
    DriverVehicleController,
  ],
  providers: [
    ApiAuthGuard,
    DriverMeService,
    DriverApplyService,
    DriverEarningsService,
    DriverRanksService,
    DriverRoutesService,
    DriverTripsService,
    DriverVehicleService,
  ],
})
export class DriverModule {}
