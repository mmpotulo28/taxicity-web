import { apiClient } from "../../../core/api/client";
import { socketEvents } from "../../../core/socket/channels";
import { emitWithAck } from "../../../core/socket/client";
import type { DriverRequest } from "../../../shared/types/driver";

export async function syncDriverRequests() {
  return emitWithAck(socketEvents.requestsSync, {});
}

export async function syncDriverRequestsHttpFallback() {
  return apiClient.get<DriverRequest[]>("/api/driver/requests");
}

export async function acceptDriverRequest(requestId: string) {
  try {
    return await emitWithAck(socketEvents.rideAccepted, { requestId });
  } catch {
    return apiClient.post<DriverRequest, { requestId: string }>("/api/driver/requests/accept", {
      requestId
    });
  }
}

export async function declineDriverRequest(requestId: string) {
  try {
    return await emitWithAck(socketEvents.rideDeclined, { requestId });
  } catch {
    return { success: true, requestId };
  }
}

export async function updatePassengerStatus(rideId: string, status: DriverRequest["status"]) {
  try {
    return await emitWithAck(socketEvents.rideStatusUpdate, { rideId, status });
  } catch {
    return apiClient.patch<DriverRequest, { status: DriverRequest["status"] }>(`/api/driver/requests/${rideId}/status`, {
      status
    });
  }
}
