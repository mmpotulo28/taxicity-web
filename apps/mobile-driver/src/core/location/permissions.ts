import * as Location from "expo-location";

export async function ensureLocationPermission() {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.status === "granted") {
    return current;
  }

  return Location.requestForegroundPermissionsAsync();
}
