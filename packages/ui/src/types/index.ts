import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
	size?: number;
};

export interface iPopularLocation {
	id: string;
	name: string;
	address: string;
	lat: number;
	lng: number;
	type?: string;
}

export interface iSavedLocation {
	id: string;
	name: string;
	address: string;
	lat: number;
	lng: number;
	type: string;
}

export interface iRoute {
	id: string;
	name: string;
	rankId: string;
	destinationRankId?: string; // Added destination rank ID
	estimatedDuration: string;
	estimatedFare: string;
	distance: string;
	status: "active" | "inactive" | "busy";
	polyline?: string;
	popularLocations?: iPopularLocation[];
}

export interface iRank {
	id: string;
	name: string;
	coordinates: {
		lat: number;
		lng: number;
	};
	address: string;
	phone: string;
	region: string;
	operatingHours?: string;
}

export interface iTaxi {
	id: string;
	driver: string;
	model: string;
	licensePlate: string;
	capacity: number;
	rating: number;
	status: "available" | "busy" | "offline";
	location?: {
		lat: number;
		lng: number;
	};
	eta?: string;
	routeId?: string;
	phone?: string;
}

export interface iTrip {
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
	status: "completed" | "cancelled" | "in-progress" | "requested" | "driver-arrived" | "accepted";
	paymentMethod: string;
	rating?: number;
	taxiId?: string;
	passengerCount?: number;
	pickupLat?: number;
	pickupLng?: number;
}
