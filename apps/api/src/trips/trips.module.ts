import { Module } from '@nestjs/common';
import { TripsService } from './trips.service.js';
import { TripsController } from './trips.controller.js';

@Module({
  controllers: [TripsController],
  providers: [TripsService],
})
export class TripsModule {}
