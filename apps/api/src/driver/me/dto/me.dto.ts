export type DriverStatusDto =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'PENDING_VERIFICATION';

export interface DriverRouteDto {
  id: string;
  name: string;
}

export interface TaxiRouteAssignmentDto {
  id: string;
  isActive: boolean;
  route: DriverRouteDto;
}

export interface DriverTaxiDto {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number | null;
  color: string;
  capacity: number;
  status: string;
  routes: TaxiRouteAssignmentDto[];
}

export interface DriverMeDto {
  id: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: DriverStatusDto;
  taxis: DriverTaxiDto[];
}
