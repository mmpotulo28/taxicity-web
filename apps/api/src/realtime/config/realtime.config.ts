const DEFAULT_DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3006',
];

const DEFAULT_PROD_ORIGINS = ['*.taxyciti.net'];

function parseCorsOrigins(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function normalizeEnvUrl(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }

  const trimmed = raw.trim();
  const maybeDecoded = (() => {
    try {
      return decodeURIComponent(trimmed);
    } catch {
      return trimmed;
    }
  })();

  // Strip accidental wrapping quotes from env systems/secrets.
  if (
    (maybeDecoded.startsWith('"') && maybeDecoded.endsWith('"')) ||
    (maybeDecoded.startsWith("'") && maybeDecoded.endsWith("'"))
  ) {
    return maybeDecoded.slice(1, -1).trim();
  }

  return maybeDecoded;
}

const envOrigins = parseCorsOrigins(process.env.CORS_ORIGINS);

const allowedOrigins =
  envOrigins.length > 0
    ? envOrigins
    : process.env.NODE_ENV === 'production'
      ? DEFAULT_PROD_ORIGINS
      : DEFAULT_DEV_ORIGINS;

function matchesWildcardPattern(origin: string, pattern: string): boolean {
  if (!pattern.startsWith('*.')) {
    return false;
  }

  try {
    const hostname = new URL(origin).hostname;
    const suffix = pattern.slice(1); // Keep leading dot for suffix match.
    return hostname.endsWith(suffix);
  } catch {
    return false;
  }
}

export function isAllowedCorsOrigin(origin: string | undefined): boolean {
  // Non-browser clients (no Origin header) should be allowed.
  if (!origin) {
    return true;
  }

  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin === origin) {
      return true;
    }

    return matchesWildcardPattern(origin, allowedOrigin);
  });
}

export const realtimeConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  internalApiKey: process.env.WS_INTERNAL_API_KEY ?? '',
  corsOrigins: allowedOrigins,
  redisUrl:
    normalizeEnvUrl(process.env.REDIS_URL) ??
    normalizeEnvUrl(process.env.UPSTASH_REDIS_URL) ??
    'redis://localhost:6379',
} as const;
