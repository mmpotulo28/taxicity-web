import { Module } from '@nestjs/common';
import { REALTIME_EMITTER } from './contracts/realtime.tokens';
import { RealtimeGateway } from './gateway/realtime.gateway';
import { RealtimeRedisService } from './infra/realtime.redis.service';
import { LocationQueueService } from './location/location-queue.service';
import { RealtimeQueueService } from './queue/realtime.queue.service';
import { RealtimeTripService } from './trips/realtime.trip.service';

@Module({
  providers: [
    RealtimeRedisService,
    LocationQueueService,
    RealtimeQueueService,
    RealtimeTripService,
    RealtimeGateway,
    { provide: REALTIME_EMITTER, useExisting: RealtimeGateway },
  ],
  exports: [RealtimeGateway, REALTIME_EMITTER],
})
export class RealtimeModule {}
