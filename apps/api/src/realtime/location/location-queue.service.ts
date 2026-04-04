import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Queue, Worker, type Job } from 'bullmq';
import { prisma } from '@taxiciti/database';
import { logger } from '@taxiciti/utils';
import { RealtimeRedisService } from '../infra/realtime.redis.service';

const QUEUE_NAME = 'location-history-queue';
const BATCH_SIZE = 50;
const BATCH_TIMEOUT_MS = 10_000;

export interface DriverLocationPayload {
  driverId: string;
  taxiId: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  timestamp: number;
}

@Injectable()
export class LocationQueueService implements OnModuleInit, OnModuleDestroy {
  private queue?: Queue<DriverLocationPayload>;
  private worker?: Worker<DriverLocationPayload>;
  private locationBuffer: DriverLocationPayload[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(private readonly redisService: RealtimeRedisService) {}

  onModuleInit(): void {
    const queueConnection = this.redisService.createDuplicate();
    const workerConnection = this.redisService.createDuplicate({
      maxRetriesPerRequest: null,
    });

    this.queue = new Queue<DriverLocationPayload>(QUEUE_NAME, {
      connection: queueConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    this.queue.on('error', (err) => {
      logger.error(err, 'Location queue error');
    });

    this.worker = new Worker<DriverLocationPayload>(
      QUEUE_NAME,
      async (job) => this.processJob(job),
      {
        connection: workerConnection,
        concurrency: 1,
      },
    );

    this.worker.on('failed', (job, err) => {
      logger.error(err, `Location job ${job?.id ?? 'unknown'} failed`);
    });

    logger.info('Location queue worker started');
  }

  async addLocation(payload: DriverLocationPayload): Promise<void> {
    if (!this.queue) {
      throw new Error('Location queue is not initialized');
    }

    await this.queue.add('persist-location', payload, {
      removeOnComplete: true,
      removeOnFail: 100,
    });
  }

  private async processJob(job: Job<DriverLocationPayload>): Promise<void> {
    this.locationBuffer.push(job.data);

    if (this.locationBuffer.length >= BATCH_SIZE) {
      await this.flushBuffer();
      return;
    }

    this.batchTimer ??= setTimeout(() => {
      void this.flushBuffer();
    }, BATCH_TIMEOUT_MS);
  }

  private async flushBuffer(): Promise<void> {
    if (this.locationBuffer.length === 0) {
      return;
    }

    const batch = [...this.locationBuffer];
    this.locationBuffer = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      await prisma.taxiLocation.createMany({
        data: batch.map((location) => ({
          taxiHistoryId: location.taxiId,
          lat: location.lat,
          lng: location.lng,
          heading: location.heading,
          speed: location.speed,
          createdAt: new Date(location.timestamp),
        })),
      });

      logger.info(`Saved ${batch.length} driver location records`);
    } catch (error) {
      logger.error(error, 'Failed to persist location batch');
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    await this.flushBuffer();

    if (this.worker) {
      await this.worker.close();
    }

    if (this.queue) {
      await this.queue.close();
    }
  }
}
