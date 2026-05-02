import { Module } from '@nestjs/common';
import { UserApiHelpers } from './common/user-api.helpers';
import { UserDriversController } from './drivers/drivers.controller';
import { UserDriversService } from './drivers/drivers.service';
import { UserRanksController } from './ranks/ranks.controller';
import { UserRanksService } from './ranks/ranks.service';
import { UserReportsController } from './reports/reports.controller';
import { UserReportsService } from './reports/reports.service';
import { UserRoutesController } from './routes/routes.controller';
import { UserRoutesService } from './routes/routes.service';
import { UserSearchController } from './search/search.controller';
import { UserSearchService } from './search/search.service';
import { UserSupportController } from './support/support.controller';
import { UserSupportService } from './support/support.service';
import { UserSystemController } from './system/system.controller';
import { UserSystemService } from './system/system.service';
import { UserTaxisController } from './taxis/taxis.controller';
import { UserTaxisService } from './taxis/taxis.service';
import { UserTripsController } from './trips/trips.controller';
import { UserTripsService } from './trips/trips.service';
import { UserUsersController } from './users/users.controller';
import { UserUsersService } from './users/users.service';

@Module({
  controllers: [
    UserSystemController,
    UserRoutesController,
    UserRanksController,
    UserTaxisController,
    UserTripsController,
    UserUsersController,
    UserDriversController,
    UserReportsController,
    UserSupportController,
    UserSearchController,
  ],
  providers: [
    UserApiHelpers,
    UserSystemService,
    UserRoutesService,
    UserRanksService,
    UserTaxisService,
    UserTripsService,
    UserUsersService,
    UserDriversService,
    UserReportsService,
    UserSupportService,
    UserSearchService,
  ],
})
export class UserApiModule {}
