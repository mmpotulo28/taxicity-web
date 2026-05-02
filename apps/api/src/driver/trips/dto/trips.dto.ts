export interface TripRouteDto {
  id: string;
  name: string;
}

export interface TripTaxiDto {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
}

export interface ActiveTripDto {
  id: string;
  status: string;
  requestTime: string;
  fare: number;
  paymentMethod: string;
  pickupAddress: string;
  dropoffAddress: string;
  route: TripRouteDto | null;
  taxi: TripTaxiDto | null;
}

export interface ActiveTripsResponseDto {
  trips: ActiveTripDto[];
}

export interface PassengerTripDto {
  id: string;
  userId: string;
  status: string;
  fare: number;
  paymentMethod: string;
  pickupAddress: string;
  dropoffAddress: string;
}

export interface VehicleTripRouteDto {
  id: string;
  name: string;
}

export interface VehicleTripTaxiDto {
  id: string;
  licensePlate: string;
}

export interface VehicleTripDto {
  id: string;
  status: string;
  capacity: number;
  manualPassengers: number;
  startTime: string | null;
  endTime: string | null;
  route: VehicleTripRouteDto | null;
  taxi: VehicleTripTaxiDto | null;
  passengers: PassengerTripDto[];
}

export interface AcceptedPassengerDto {
  id: string;
  status: string;
  acceptTime: string | null;
  platformFee: number;
  taxiId: string | null;
  routeId: string;
  vehicleTripId: string | null;
}
