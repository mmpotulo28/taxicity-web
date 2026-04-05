import * as Location from "expo-location";

import { ensureLocationPermission } from "./permissions";

export type TrackingCadence = "IDLE" | "ACTIVE";

export function cadenceToInterval(cadence: TrackingCadence) {
  return cadence === "ACTIVE" ? 5000 : 20000;
}

export async function startAdaptiveTracking(
  cadence: TrackingCadence,
  onLocation: (location: Location.LocationObject) => Promise<void> | void
) {
  const permission = await ensureLocationPermission();
  if (permission.status !== "granted") {
    throw new Error("Location permission denied");
  }

  return await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: cadenceToInterval(cadence),
      distanceInterval: cadence === "ACTIVE" ? 10 : 35
    },
    (location) => {
      void onLocation(location);
    }
  );
}
