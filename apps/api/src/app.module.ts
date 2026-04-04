import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RealtimeModule } from './realtime/realtime.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [RealtimeModule, HealthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
