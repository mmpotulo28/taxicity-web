import type {
  DriverLocationMessage,
  PaymentMethod,
  TripStatus
} from "@taxiciti/utils";

export type { PaymentMethod, TripStatus };

export type DriverEligibilityStatus = "ACTIVE" | "PENDING" | "INACTIVE" | "REJECTED" | "UNKNOWN";

export interface DriverProfile {
  id: string;
  firstName: string;
  lastName: string;
  status: DriverEligibilityStatus;
  taxis: Array<{
    id: string;
    licensePlate: string;
    make: string;
    model: string;
    year: number;
    status: string;
  }>;
}

export interface DriverEligibilityDto {
  isEligible: boolean;
  status: DriverEligibilityStatus;
  profile: DriverProfile | null;
}

export interface DriverRequest {
  id: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  fare: number;
  status: TripStatus;
  paymentMethod: PaymentMethod;
}

export interface VehicleTrip {
  id: string;
  status: "BOARDING" | "IN_PROGRESS" | "COMPLETED";
  route: {
    id: string;
    name: string;
  };
  taxi: {
    id: string;
    licensePlate: string;
  };
}

export interface ShiftStartInput {
  taxiId: string;
  routeId: string;
}

export type DriverLocationPayload = DriverLocationMessage;
