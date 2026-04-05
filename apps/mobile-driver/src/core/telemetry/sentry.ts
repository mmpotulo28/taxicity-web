import * as Sentry from "@sentry/react-native";

import { logger } from "./logger";

export function initSentry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    logger.warn("Sentry DSN missing; telemetry fallback active");
    return;
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 0.2
  });
}
