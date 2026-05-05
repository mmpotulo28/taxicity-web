import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { RealtimeModule } from './realtime/realtime.module';
import { HealthModule } from './health/health.module';
import { DriverModule } from './driver/driver.module';
import { UploadModule } from './upload/upload.module';
import { UserApiModule } from './user/user-api.module';
import { ApiAuthGuard } from './driver/common/api-auth.guard';

@Module({
  imports: [
    RealtimeModule,
    HealthModule,
    DriverModule,
    UploadModule,
    UserApiModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ApiAuthGuard }],
})
export class AppModule {}
