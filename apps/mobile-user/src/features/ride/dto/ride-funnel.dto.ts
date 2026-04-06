export interface RouteDto {
id: string;
name: string;
estimatedFare: string;
rankId: string;
}

export interface RankDto {
id: string;
name: string;
address: string;
region: string;
coordinates: {
lat: number;
lng: number;
};
}

export interface TaxiDto {
id: string;
driver: string;
model: string;
licensePlate: string;
status: string;
routeId?: string;
}

export interface RideRequestDto {
routeId: string;
rankId: string;
pickupAddress: string;
dropoffAddress: string;
fare: number;
paymentMethod: "CASH";
}

export interface RideRequestResponseDto {
id: string;
status: string;
requestTime: string;
taxiId?: string;
}
