export interface RouteRankDto {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface PopularLocationDto {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: string | null;
}

export interface DriverRouteDto {
  id: string;
  name: string;
  description: string | null;
  distance: number;
  baseFare: number;
  estimatedDuration: number;
  polyline: string | null;
  status: string;
  sourceRank: RouteRankDto;
  destRank: RouteRankDto | null;
  popularLocations: PopularLocationDto[];
}

export interface DriverRoutesPaginationDto {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DriverRoutesResponseDto {
  routes: DriverRouteDto[];
  pagination: DriverRoutesPaginationDto;
}

export interface DriverRouteAssignmentDto {
  id: string;
  taxiId: string;
  routeId: string;
  isActive: boolean;
}
