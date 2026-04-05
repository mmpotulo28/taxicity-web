import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis, { type RedisOptions } from 'ioredis';
import { logger } from '@taxiciti/utils';
import { realtimeConfig } from '../config/realtime.config';

@Injectable()
export class RealtimeRedisService implements OnModuleDestroy {
  private readonly primaryClient: Redis;
  private readonly managedClients: Redis[] = [];

  constructor() {
    this.primaryClient = new Redis(realtimeConfig.redisUrl);
    this.managedClients.push(this.primaryClient);

    this.primaryClient.on('error', (err: Error) => {
      logger.error(err, 'Redis client error');
    });

    this.primaryClient.on('connect', () => {
      logger.info('Realtime Redis client connected');
    });
  }

  getPrimaryClient(): Redis {
    return this.primaryClient;
  }

  createDuplicate(options?: RedisOptions): Redis {
    const client = this.primaryClient.duplicate(options);
    this.managedClients.push(client);
    client.on('error', (err: Error) => {
      logger.error(err, 'Realtime Redis duplicate error');
    });
    return client;
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(
      this.managedClients.map(async (client) => {
        if (client.status !== 'end') {
          try {
            await client.quit();
          } catch {
            client.disconnect();
          }
        }
      }),
    );
  }
}
