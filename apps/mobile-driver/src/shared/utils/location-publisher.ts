import { AppState } from "react-native";
import type { LocationObject, LocationSubscription } from "expo-location";

import { startAdaptiveTracking, type TrackingCadence } from "../../core/location/tracking";
import { emitWithAck } from "../../core/socket/client";
import { logger } from "../../core/telemetry/logger";

let subscription: LocationSubscription | null = null;

function normalizeCadence(): TrackingCadence {
  return AppState.currentState === "active" ? "ACTIVE" : "IDLE";
}

async function publishLocation(location: LocationObject, taxiId: string) {
  try {
    await emitWithAck("driver-location", {
      taxiId,
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      heading: location.coords.heading ?? undefined,
      speed: location.coords.speed ?? undefined
    });
  } catch (error) {
    logger.warn("Location publish failed", {
      taxiId,
      error: error instanceof Error ? error.message : "unknown"
    });
  }
}

export async function startLocationPublishing(taxiId: string) {
  if (subscription) {
    return;
  }

  subscription = await startAdaptiveTracking(normalizeCadence(), async (location) => {
    await publishLocation(location, taxiId);
  });
}

export function stopLocationPublishing() {
  subscription?.remove();
  subscription = null;
}
