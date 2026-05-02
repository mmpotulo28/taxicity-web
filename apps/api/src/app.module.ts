import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RealtimeModule } from './realtime/realtime.module';
import { HealthModule } from './health/health.module';
import { DriverModule } from './driver/driver.module';
import { UploadModule } from './upload/upload.module';
import { UserApiModule } from './user/user-api.module';

@Module({
  imports: [
    RealtimeModule,
    HealthModule,
    DriverModule,
    UploadModule,
    UserApiModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
