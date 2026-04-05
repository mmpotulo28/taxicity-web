export const realtimeConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  internalApiKey: process.env.WS_INTERNAL_API_KEY ?? '',
  corsOrigin: process.env.NODE_ENV === 'production' ? '*.taxyciti.net' : '*',
  redisUrl:
    process.env.REDIS_URL ??
    process.env.UPSTASH_REDIS_URL ??
    'redis://localhost:6379',
} as const;
