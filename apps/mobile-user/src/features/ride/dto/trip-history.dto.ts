export interface TripHistoryItemDto {
	id: string;
	route: string;
	date: string;
	time: string;
	pickup: string;
	dropoff: string;
	driver: string;
	vehicle: string;
	licensePlate: string;
	fare: string;
	status: string;
	paymentMethod: string;
	taxiId?: string;
}

export interface TripRatingPayloadDto {
	rating: number;
}
