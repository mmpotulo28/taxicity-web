export interface ApiPaginationDto {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiMessageDto {
  message: string;
}

export type EntityDto = Record<string, unknown>;

export interface RoutesListResponseDto {
  routes: EntityDto[];
  pagination: ApiPaginationDto;
}

export interface RanksListResponseDto {
  ranks: EntityDto[];
  pagination: ApiPaginationDto;
}

export interface TaxisListResponseDto {
  taxis: EntityDto[];
  pagination: ApiPaginationDto;
}

export interface TaxiLocationHistoryResponseDto {
  locations: EntityDto[];
  pagination: ApiPaginationDto;
}

export interface TripsBoardRideResponseDto {
  message: string;
  trip: EntityDto;
}

export interface DriversListResponseDto {
  drivers: EntityDto[];
  pagination: ApiPaginationDto;
}

export interface ReportsListResponseDto {
  reports: EntityDto[];
  pagination: ApiPaginationDto;
}

export interface SupportTicketsListResponseDto {
  tickets: EntityDto[];
  pagination: ApiPaginationDto;
}

export interface UserProfileCountsDto {
  trips: number;
  tripRatings: number;
  favoriteDrivers: number;
}

export interface UserProfileResponseDto {
  id: string;
  savedLocations: EntityDto[];
  emergencyContacts: EntityDto[];
  lastKnownLocation: EntityDto | null;
  _count: UserProfileCountsDto;
}

export interface SearchResultsDto {
  taxis: EntityDto[];
  drivers: EntityDto[];
  routes: EntityDto[];
  ranks: EntityDto[];
  users: EntityDto[];
}

export interface SearchResponseDto {
  query: string;
  type: string;
  results: SearchResultsDto;
  total: number;
}

export type OpenApiDocumentDto = Record<string, unknown>;
