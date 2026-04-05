export interface RouteDto {
id: string;
name: string;
estimatedFare: string;
rankId: string;
}

export interface RoutesResponseDto {
routes: RouteDto[];
}
