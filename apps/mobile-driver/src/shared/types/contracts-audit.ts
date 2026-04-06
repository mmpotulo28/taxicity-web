import type { DriverLocationPayload, DriverRequest, TripStatus, VehicleTrip } from "./driver";

export interface ShiftLifecycleTransition {
  from: "IDLE" | "BOARDING" | "IN_PROGRESS" | "COMPLETED";
  event: string;
  to: "IDLE" | "BOARDING" | "IN_PROGRESS" | "COMPLETED";
  source: string;
}

export interface RequestLifecycleTransition {
  from: "REQUESTED" | "ACCEPTED" | "ARRIVED_AT_PICKUP" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  event: string;
  to: "REQUESTED" | "ACCEPTED" | "ARRIVED_AT_PICKUP" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  source: string;
}

export const SHIFT_LIFECYCLE_TRANSITIONS: ShiftLifecycleTransition[] = [
  { from: "IDLE", event: "POST /api/driver/trips/vehicle", to: "BOARDING", source: "apps/driver/context/DriverContext.tsx" },
  { from: "BOARDING", event: "socket:ride-status-update => IN_PROGRESS", to: "IN_PROGRESS", source: "apps/driver/context/DriverContext.tsx" },
  { from: "BOARDING", event: "PATCH /api/driver/trips/vehicle/:id status=COMPLETED", to: "COMPLETED", source: "apps/driver/context/DriverContext.tsx" },
  { from: "IN_PROGRESS", event: "PATCH /api/driver/trips/vehicle/:id status=COMPLETED", to: "COMPLETED", source: "apps/driver/context/DriverContext.tsx" },
  { from: "COMPLETED", event: "local reset activeVehicleTrip=null", to: "IDLE", source: "apps/driver/context/DriverContext.tsx" }
];

export const REQUEST_LIFECYCLE_TRANSITIONS: RequestLifecycleTransition[] = [
  { from: "REQUESTED", event: "socket:new-ride-request", to: "REQUESTED", source: "apps/driver/context/DriverContext.tsx" },
  { from: "REQUESTED", event: "socket:ride-accepted", to: "ACCEPTED", source: "apps/driver/context/DriverContext.tsx" },
  { from: "ACCEPTED", event: "socket:ride-status-update => ARRIVED_AT_PICKUP", to: "ARRIVED_AT_PICKUP", source: "apps/driver/context/DriverContext.tsx" },
  { from: "ARRIVED_AT_PICKUP", event: "socket:ride-status-update => IN_PROGRESS", to: "IN_PROGRESS", source: "apps/driver/context/DriverContext.tsx" },
  { from: "IN_PROGRESS", event: "socket:ride-status-update => COMPLETED", to: "COMPLETED", source: "apps/driver/context/DriverContext.tsx" },
  { from: "REQUESTED", event: "socket:ride-taken or cancel", to: "CANCELLED", source: "apps/driver/context/DriverContext.tsx" }
];

export interface EndpointContract {
  path: string;
  method: "GET" | "POST" | "PATCH";
  payload?: string;
  response: string;
  source: string;
}

export const DRIVER_ENDPOINT_CONTRACTS: EndpointContract[] = [
  { path: "/api/driver/me", method: "GET", response: "DriverProfile", source: "apps/driver/context/DriverContext.tsx, apps/driver/app/profile/page.tsx" },
  { path: "/api/driver/trips/vehicle", method: "GET", response: "VehicleTrip[]", source: "apps/driver/context/DriverContext.tsx" },
  { path: "/api/driver/trips/vehicle", method: "POST", payload: "{ taxiId, routeId }", response: "VehicleTrip", source: "apps/driver/context/DriverContext.tsx" },
  { path: "/api/driver/trips/vehicle/:id", method: "PATCH", payload: "{ status: COMPLETED } | { manualPassengers }", response: "VehicleTrip | { manualPassengers }", source: "apps/driver/context/DriverContext.tsx" },
  { path: "/api/driver/ranks?limit=50", method: "GET", response: "{ ranks: Rank[] }", source: "apps/driver/components/RankQueue.tsx" },
  { path: "/api/driver/apply", method: "POST", payload: "ApplicationForm", response: "ApplicationResult", source: "apps/driver/app/apply/page.tsx" },
  { path: "/api/driver/vehicle", method: "POST", payload: "VehicleRegistration", response: "Vehicle", source: "apps/driver/components/VehicleRegistration.tsx" }
];

export interface SocketContract<TPayload = unknown, TAck = unknown> {
  event: string;
  payloadType: TPayload;
  ackType: TAck;
  source: string;
  todo?: string;
}

export type DriverSocketChecklist = {
  requestsSync: SocketContract<Record<string, never>, DriverRequest[]>;
  accept: SocketContract<{ requestId: string }, DriverRequest>;
  decline: SocketContract<{ requestId: string }, { success: boolean }>;
  statusUpdate: SocketContract<{ rideId: string; status: TripStatus }, DriverRequest>;
  locationSync: SocketContract<DriverLocationPayload, { success: boolean }>;
  queueJoin: SocketContract<{ rankId: string; taxiId: string }, { position?: number }>;
};

export const DRIVER_SOCKET_CHECKLIST: DriverSocketChecklist = {
  requestsSync: {
    event: "driver-requests-sync",
    payloadType: {},
    ackType: [],
    source: "apps/driver/context/DriverContext.tsx"
  },
  accept: {
    event: "ride-accepted",
    payloadType: { requestId: "" },
    ackType: {} as DriverRequest,
    source: "apps/driver/context/DriverContext.tsx"
  },
  decline: {
    event: "ride-declined",
    payloadType: { requestId: "" },
    ackType: { success: true },
    source: "Phase 0 gap",
    todo: "TODO(contract): backend event name and ack contract for explicit decline flow is missing in active web codepaths"
  },
  statusUpdate: {
    event: "ride-status-update",
    payloadType: { rideId: "", status: "IN_PROGRESS" as TripStatus },
    ackType: {} as DriverRequest,
    source: "apps/driver/context/DriverContext.tsx"
  },
  locationSync: {
    event: "driver-location",
    payloadType: { taxiId: "", lat: 0, lng: 0 },
    ackType: { success: true },
    source: "apps/driver/context/DriverContext.tsx",
    todo: "TODO(contract): backend ack currently fire-and-forget in web flow, explicit ack timeout contract required"
  },
  queueJoin: {
    event: "driver-queue-join",
    payloadType: { rankId: "", taxiId: "" },
    ackType: { position: 0 },
    source: "apps/driver/components/RankQueue.tsx"
  }
};

export const PHASE0_BLOCKERS: string[] = [
  "TODO(contract): confirm explicit ride-declined socket event and fallback HTTP endpoint for declined requests",
  "TODO(contract): confirm server ack SLA and retry contract for driver-location publishes"
];

export type _ContractSanity = VehicleTrip;
