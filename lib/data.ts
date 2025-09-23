import { iRank, iRoute, iTaxi } from "@/types";

// Sample data for routes and ranks
export const routes: iRoute[] = [
	{
		id: "1",
		name: "CBD to Soweto",
		rankId: "1",
		estimatedTime: "30 mins",
		estimatedFare: "R15.00 - R25.00",
		status: "Active",
	},
	{
		id: "2",
		name: "Sandton to Alexandra",
		rankId: "2",
		estimatedTime: "25 mins",
		estimatedFare: "R12.00 - R20.00",
		status: "Active",
	},
	{
		id: "3",
		name: "Pretoria to Johannesburg",
		rankId: "3",
		estimatedTime: "45 mins",
		estimatedFare: "R30.00 - R50.00",
		status: "Inactive",
	},
	{
		id: "4",
		name: "Randburg to Midrand",
		rankId: "4",
		estimatedTime: "35 mins",
		estimatedFare: "R18.00 - R28.00",
		status: "Active",
	},
	{
		id: "5",
		name: "Roodepoort to Krugersdorp",
		rankId: "5",
		estimatedTime: "40 mins",
		estimatedFare: "R25.00 - R35.00",
		status: "Inactive",
	},
];

// sample ranks for popular locations
export const ranks: iRank[] = [
	{
		id: "1",
		name: "Central Rank",
		city: "Johannesburg",
		province: "Gauteng",
		town: "Johannesburg",
	},
	{
		id: "2",
		name: "North Rank",
		city: "Johannesburg",
		province: "Gauteng",
		town: "Johannesburg",
	},
	{ id: "3", name: "East Rank", city: "Johannesburg", province: "Gauteng", town: "Johannesburg" },
	{ id: "4", name: "West Rank", city: "Johannesburg", province: "Gauteng", town: "Johannesburg" },
	{
		id: "5",
		name: "South Rank",
		city: "Johannesburg",
		province: "Gauteng",
		town: "Johannesburg",
	},
];

// Sample taxi data
export const taxis: iTaxi[] = [
	{
		id: "1",
		driverName: "Sipho Mabena",
		vehicleInfo: "Toyota Quantum - White",
		licensePlate: "GP 123-456",
		rating: 4.8,
		distance: "2 min away",
		eta: "5 min",
	},
	{
		id: "2",
		driverName: "Thabo Ndlovu",
		vehicleInfo: "Toyota HiAce - Silver",
		licensePlate: "GP 789-012",
		rating: 4.5,
		distance: "5 min away",
		eta: "8 min",
	},
	{
		id: "3",
		driverName: "Mandla Khumalo",
		vehicleInfo: "Nissan Impendulo - White",
		licensePlate: "GP 345-678",
		rating: 4.7,
		distance: "7 min away",
		eta: "10 min",
	},
];

export const popularLocations = [
	"Bree Street Taxi Rank",
	"Gandhi Square",
	"Park Station",
	"Westgate Taxi Rank",
	"Noord Street Taxi Rank",
	"Newtown Taxi Rank",
];
