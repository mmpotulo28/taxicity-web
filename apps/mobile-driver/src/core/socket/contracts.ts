import type { DriverLocationPayload, DriverRequest, TripStatus } from "../../shared/types/driver";

export interface SocketAck<TData> {
  success: boolean;
  data?: TData;
  message?: string;
}

export interface DriverSocketContracts {
  "driver-requests-sync": {
    payload: Record<string, never>;
    ack: DriverRequest[];
  };
  "ride-accepted": {
    payload: { requestId: string };
    ack: DriverRequest;
  };
  "ride-status-update": {
    payload: { rideId: string; status: TripStatus };
    ack: DriverRequest;
  };
  "ride-declined": {
    payload: { requestId: string };
    ack: { success: boolean; requestId?: string };
  };
  "driver-location": {
    payload: DriverLocationPayload;
    ack: { success: boolean };
  };
}

export const SOCKET_CONTRACT_TODOS = {
  decline: "TODO(contract): backend ride-declined ack exists; align multi-client decline side effects if server-side state mutation is added",
  locationAck: "TODO(contract): backend driver-location handler is fire-and-forget (no ack callback), keep mobile publish as non-ack emit"
} as const;
