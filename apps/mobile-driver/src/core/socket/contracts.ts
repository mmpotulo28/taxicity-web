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
  "driver-location": {
    payload: DriverLocationPayload;
    ack: { success: boolean };
  };
}

export const SOCKET_CONTRACT_TODOS = {
  decline: "TODO(contract): backend ride decline event + ack not documented in active web flow",
  locationAck: "TODO(contract): backend location ack currently not guaranteed"
} as const;
