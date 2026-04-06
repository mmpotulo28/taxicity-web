import { useMutation, useQuery } from "@tanstack/react-query";
import { getTripById, getTripHistory, submitTripRating } from "../services/trip-history.service";

export function useTripHistory() {
	const tripsQuery = useQuery({
		queryKey: ["mobile-user", "trip-history"],
		queryFn: getTripHistory,
	});

	return {
		tripsQuery,
	};
}

export function useTripDetails(tripId: string) {
	const tripQuery = useQuery({
		queryKey: ["mobile-user", "trip-details", tripId],
		queryFn: () => getTripById(tripId),
		enabled: Boolean(tripId),
	});

	const rateTripMutation = useMutation({
		mutationFn: (rating: number) => submitTripRating(tripId, { rating }),
	});

	return {
		tripQuery,
		rateTripMutation,
	};
}
