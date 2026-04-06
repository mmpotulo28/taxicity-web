import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { getTripById, getTripHistory, getTripHistoryPage, submitTripRating } from "../services/trip-history.service";

export function useTripHistory() {
	const tripsQuery = useQuery({
		queryKey: ["mobile-user", "trip-history"],
		queryFn: getTripHistory,
		staleTime: 30_000,
		gcTime: 300_000,
	});

	return {
		tripsQuery,
	};
}

export function useTripHistoryInfinite(limit = 20) {
	const infiniteTripsQuery = useInfiniteQuery({
		queryKey: ["mobile-user", "trip-history", "infinite", limit],
		initialPageParam: 1,
		queryFn: ({ pageParam }) => getTripHistoryPage(pageParam, limit),
		getNextPageParam: (lastPage) => {
			const { page, pages } = lastPage.pagination;
			return page < pages ? page + 1 : undefined;
		},
		staleTime: 30_000,
		gcTime: 300_000,
	});

	const trips = (infiniteTripsQuery.data?.pages ?? []).flatMap((page) => page.items);

	return {
		infiniteTripsQuery,
		trips,
	};
}

export function useTripDetails(tripId: string) {
	const queryClient = useQueryClient();
	const tripQuery = useQuery({
		queryKey: ["mobile-user", "trip-details", tripId],
		queryFn: () => getTripById(tripId),
		enabled: Boolean(tripId),
		staleTime: 30_000,
		gcTime: 300_000,
	});

	const rateTripMutation = useMutation({
		mutationFn: (rating: number) => submitTripRating(tripId, { rating }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["mobile-user", "trip-history"] });
			await queryClient.invalidateQueries({ queryKey: ["mobile-user", "trip-details", tripId] });
		},
	});

	return {
		tripQuery,
		rateTripMutation,
	};
}
