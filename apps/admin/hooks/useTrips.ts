import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Trip, VehicleTrip, Driver, Route, Taxi } from "@taxiciti/database/types";
import { addToast } from "@heroui/toast";

// Extended Trip type including relations
export type TripWithDetails = Trip & {
	route: Route;
	vehicleTrip:
		| (VehicleTrip & {
				driver: Driver;
				route: Route;
				taxi: Taxi;
		  })
		| null;
};

export const useTrips = () => {
	const queryClient = useQueryClient();

	// --- Queries ---
	const {
		data: trips,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<TripWithDetails[]>({
		queryKey: ["trips"],
		queryFn: async () => {
			const { data } = await axios.get("/api/trips");
			return data;
		},
		refetchInterval: 30000,
	});

	// --- Mutations ---

	// Cancel Trip
	const cancelTripMutation = useMutation({
		mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
			const { data } = await axios.patch(`/api/trips/${id}/cancel`, { reason });
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["trips"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			addToast({
				title: "Trip Cancelled",
				description: "The trip has been successfully cancelled.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Error",
				description: "Failed to cancel trip. Please try again.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// Update Trip (General)
	const updateTripMutation = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<Trip> }) => {
			const res = await axios.patch(`/api/trips/${id}`, data);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["trips"] });
			addToast({
				title: "Trip Updated",
				description: "Trip details have been updated.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Update Failed",
				description: "Could not update trip details.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// --- Helper Functions ---

	// Get single trip from cache or fetch
	const getTripById = (id: string) => {
		return trips?.find((t) => t.id === id);
	};

	return {
		// Data & Query State
		trips,
		isLoading,
		isError,
		error,
		refetch,

		// Actions
		cancelTrip: cancelTripMutation.mutateAsync,
		updateTrip: updateTripMutation.mutateAsync,

		// Action States
		isCancelling: cancelTripMutation.isPending,
		isUpdating: updateTripMutation.isPending,

		// Helpers
		getTripById,
	};
};
