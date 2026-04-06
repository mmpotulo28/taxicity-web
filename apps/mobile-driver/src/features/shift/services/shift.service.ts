import { apiClient } from "../../../core/api/client";
import type { ShiftStartInput, VehicleTrip } from "../../../shared/types/driver";

export async function fetchActiveShift() {
  const shifts = await apiClient.get<VehicleTrip[]>("/api/driver/trips/vehicle");
  const activeShift = shifts.find(
    (shift) => shift.status === "BOARDING" || shift.status === "IN_PROGRESS"
  );
  return activeShift ?? null;
}

export async function startShift(input: ShiftStartInput) {
  return apiClient.post<VehicleTrip, { taxiId: string; routeId: string }>(
    "/api/driver/trips/vehicle",
    {
      taxiId: input.taxiId,
      routeId: input.routeId
    }
  );
}

export async function endShift(shiftId: string) {
  return apiClient.patch<VehicleTrip, { status: "COMPLETED" }>(
    `/api/driver/trips/vehicle/${shiftId}`,
    {
      status: "COMPLETED"
    }
  );
}
