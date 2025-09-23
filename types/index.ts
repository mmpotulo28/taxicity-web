import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
	size?: number;
};

export interface iRoute {
	id: string;
	name: string;
	rankId: string;
	estimatedTime?: string;
	estimatedFare?: string;
	status: string;
}

export interface iRank {
	id: string;
	name: string;
	city: string;
	province: string;
	town: string;
}

export interface iTaxi {
	id: string;
	driverName: string;
	vehicleInfo: string;
	licensePlate: string;
	rating: number;
	distance: string;
	eta: string;
}
