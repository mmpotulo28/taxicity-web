import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
	size?: number;
};

export interface iRoute {
	id: string;
	name: string;
	rankId: string;
	destinationRankId?: string; // Added destination rank ID
	estimatedDuration: string;
	estimatedFare: string;
	distance: string;
	status: "active" | "inactive" | "busy";
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
	status: "completed" | "cancelled" | "in-progress";
	paymentMethod: string;
	rating?: number;
}

export interface iDriver {
	id: string;
	name: string;
	phone: string;
	licenseNumber: string;
	licenseExpiry: string;
	status: "active" | "suspended" | "inactive" | "pending";
	joinDate: string;
	rating: number;
	totalTrips: number;
	avatar: string;
	taxiId?: string;
}

export interface iDocument {
	id: string;
	taxiId: string;
	type: string;
	fileName: string;
	uploadDate: string;
	expiryDate: string;
	status: "verified" | "pending" | "expired" | "rejected";
}

export interface iRankDetail extends iRank {
	capacity: number;
	currentOccupancy: number;
	operatingHours: string;
	facilities: string[];
	managers: string[];
	lastInspection: string;
}

export interface iAdminUser {
	id: string;
	name: string;
	email: string;
	role: "Super Admin" | "Operations Manager" | "Support Agent" | "Data Analyst";
	status: "active" | "inactive";
	lastLogin: string;
	avatar: string;
}

export interface iSupportTicket {
	id: string;
	subject: string;
	description: string;
	status: "open" | "in-progress" | "resolved" | "closed";
	priority: "low" | "medium" | "high";
	createdDate: string;
	customerName: string;
	customerEmail: string;
	assignedTo: string | null;
	category: string;
	resolution?: string;
	relatedDriverId?: string;
	relatedTripId?: string;
	relatedTaxiId?: string;
}

export interface iActivityLog {
	id: string;
	action: string;
	description: string;
	timestamp: string;
	userId: string;
	ipAddress: string;
	driverId?: string;
	taxiId?: string;
	routeId?: string;
	ticketId?: string;
	reportType?: string;
}

export interface iReportTemplate {
	id: string;
	name: string;
	description: string;
	type: string;
	format: "PDF" | "Excel" | "CSV";
	schedule: "daily" | "weekly" | "monthly" | "quarterly";
	recipients: string[];
}
