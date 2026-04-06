import { useMutation, useQuery } from "@tanstack/react-query";
import { getRideRanks, getRideRoutes, getRideTaxis, requestRide } from "../services/ride-funnel.service";
import { useRideFunnelStore } from "../store/ride-funnel.store";

export function useRideFunnel() {
	const store = useRideFunnelStore();

	const routesQuery = useQuery({
		queryKey: ["mobile-user", "ride", "routes"],
		queryFn: getRideRoutes,
	});

	const ranksQuery = useQuery({
		queryKey: ["mobile-user", "ride", "ranks"],
		queryFn: getRideRanks,
	});

	const taxisQuery = useQuery({
		queryKey: ["mobile-user", "ride", "taxis"],
		queryFn: getRideTaxis,
	});

	const requestRideMutation = useMutation({
		mutationFn: requestRide,
		onSuccess: (trip) => {
			store.setActiveTrip(trip);
		},
	});

	return {
		...store,
		routesQuery,
		ranksQuery,
		taxisQuery,
		requestRideMutation,
	};
}
