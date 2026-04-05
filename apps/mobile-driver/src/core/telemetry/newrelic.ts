import NewRelic from "newrelic-react-native-agent";

import { logger } from "./logger";

export function initNewRelic() {
  const token = process.env.EXPO_PUBLIC_NEWRELIC_APP_TOKEN;
  if (!token) {
    logger.warn("NewRelic token missing; telemetry fallback active");
    return;
  }

  NewRelic.startAgent(token, {
    analyticsEventEnabled: true,
    networkRequestEnabled: true,
    crashReportingEnabled: true,
    interactionTracingEnabled: true,
    loggingEnabled: false,
    webViewInstrumentation: false,
    fedRampEnabled: false,
    offlineStorageEnabled: true,
    newEventSystemEnabled: true,
    distributedTracingEnabled: true
  });
}
