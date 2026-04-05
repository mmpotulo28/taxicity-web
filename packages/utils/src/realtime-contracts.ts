export type PaymentMethod = "CASH" | "QR_CODE" | "MOBILE_MONEY";
export type TripStatus = "REQUESTED" | "ACCEPTED" | "ARRIVED_AT_PICKUP" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface RideRequestPayload {
	routeId: string;
	rankId: string;
	pickupAddress: string;
	pickupLat: number;
	pickupLng: number;
	dropoffAddress: string;
	dropoffLat: number;
	dropoffLng: number;
	fare: number;
	paymentMethod?: PaymentMethod;
	taxiId?: string;
}

export interface RideAcceptedPayload {
	requestId: string;
}

export interface RideStatusPayload {
	rideId: string;
	status: TripStatus;
}

export interface ChatMessagePayload {
	rideId: string;
	message: string;
	senderId: string;
	receiverId: string;
}

export interface DriverLocationMessage {
	taxiId: string;
	lat: number;
	lng: number;
	heading?: number;
	speed?: number;
}

export type WsAck<T> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			message: string;
	  };
