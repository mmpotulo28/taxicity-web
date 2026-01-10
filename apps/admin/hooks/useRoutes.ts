import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Route, Rank } from "@taxicity/database";
import { addToast } from "@heroui/toast";

export type RouteWithRanks = Route & {
	sourceRank: Rank;
	destRank: Rank;
};

export const useRoutes = () => {
	const queryClient = useQueryClient();

	// --- Queries ---
	const {
		data: routes,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<RouteWithRanks[]>({
		queryKey: ["routes"],
		queryFn: async () => {
			const { data } = await axios.get("/api/routes");
			return data;
		},
	});

	// --- Mutations ---

	// Create Route
	const createRouteMutation = useMutation({
		mutationFn: async (newRoute: Partial<Route>) => {
			const { data } = await axios.post("/api/routes", newRoute);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["routes"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			addToast({
				title: "Route Created",
				description: "New route has been successfully created.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Error",
				description: "Failed to create route. Please try again.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// Update Route
	const updateRouteMutation = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<Route> }) => {
			const res = await axios.patch(`/api/routes/${id}`, data);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["routes"] });
			addToast({
				title: "Route Updated",
				description: "Route details have been updated.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Update Failed",
				description: "Could not update route details.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// Delete Route
	const deleteRouteMutation = useMutation({
		mutationFn: async (id: string) => {
			await axios.delete(`/api/routes/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["routes"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			addToast({
				title: "Route Deleted",
				description: "Route has been removed from the system.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Delete Failed",
				description: "Could not remove route.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// --- Helpers ---
	const getRouteById = (id: string) => {
		return routes?.find((r) => r.id === id);
	};

	return {
		// Data & Query State
		routes,
		isLoading,
		isError,
		error,
		refetch,

		// Actions
		createRoute: createRouteMutation.mutateAsync,
		updateRoute: updateRouteMutation.mutateAsync,
		deleteRoute: deleteRouteMutation.mutateAsync,

		// Action States
		isCreating: createRouteMutation.isPending,
		isUpdating: updateRouteMutation.isPending,
		isDeleting: deleteRouteMutation.isPending,

		// Helpers
		getRouteById,
	};
};
