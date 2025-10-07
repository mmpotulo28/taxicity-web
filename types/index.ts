import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
	size?: number;
};

export interface iRoute {
	id: string;
	name: string;
	rankId: string;
	description?: string;
	estimatedFare: string;
	estimatedDuration: string;
	distance: string;
	status: "active" | "busy" | "delayed";
}

export interface iRank {
	id: string;
	name: string;
	location: string;
	coordinates: {
		lat: number;
		lng: number;
	};
	capacity: number;
	operatingHours: string;
}

export interface iTaxi {
	id: string;
	registrationNumber: string;
	driver: string;
	phone: string;
	capacity: number;
	model: string;
	status: "available" | "on-trip" | "offline";
	routes: string[];
	rating: number;
	location?: {
		lat: number;
		lng: number;
	};
}

export interface iTrip {
	id: string;
	route: string;
	date: string;
	time: string;
	pickup: string;
	dropoff: string;
	fare: string;
	status: "completed" | "cancelled" | "in-progress";
	driver: string;
	vehicle: string;
	licensePlate: string;
	paymentMethod: string;
}
