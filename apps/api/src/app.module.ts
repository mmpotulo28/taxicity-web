import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RealtimeModule } from './realtime/realtime.module';
import { HealthModule } from './health/health.module';
import { DriverModule } from './driver/driver.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    RealtimeModule,
    HealthModule,
    DriverModule,
    NotificationsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
