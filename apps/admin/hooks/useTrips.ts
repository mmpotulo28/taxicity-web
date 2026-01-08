import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Trip, VehicleTrip, Driver, Route, Taxi } from "@taxicity/database";

// Extended Trip type including relations
export type TripWithDetails = Trip & {
	vehicleTrip:
		| (VehicleTrip & {
				driver: Driver;
				route: Route;
				taxi: Taxi;
		  })
		| null;
};

export const useTrips = () => {
	return useQuery<TripWithDetails[]>({
		queryKey: ["trips"],
		queryFn: async () => {
			const { data } = await axios.get("/api/trips");
			return data;
		},
		refetchInterval: 30000,
	});
};
