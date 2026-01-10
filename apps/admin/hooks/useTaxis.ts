import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Taxi } from "@taxicity/database";
import { addToast } from "@heroui/toast";

export const useTaxis = () => {
	const queryClient = useQueryClient();

	// --- Queries ---
	const {
		data: taxis,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<Taxi[]>({
		queryKey: ["taxis"],
		queryFn: async () => {
			const { data } = await axios.get("/api/taxis");
			return data;
		},
	});

	// --- Mutations ---

	// Add Taxi
	const addTaxiMutation = useMutation({
		mutationFn: async (newTaxi: Partial<Taxi>) => {
			const { data } = await axios.post("/api/taxis", newTaxi);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["taxis"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			addToast({
				title: "Taxi Added",
				description: "New taxi has been successfully registered.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Error",
				description: "Failed to add taxi. Please try again.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// Update Taxi
	const updateTaxiMutation = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<Taxi> }) => {
			const res = await axios.patch(`/api/taxis/${id}`, data);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["taxis"] });
			addToast({
				title: "Taxi Updated",
				description: "Taxi details have been updated.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Update Failed",
				description: "Could not update taxi details.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// Delete Taxi
	const deleteTaxiMutation = useMutation({
		mutationFn: async (id: string) => {
			await axios.delete(`/api/taxis/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["taxis"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			addToast({
				title: "Taxi Deleted",
				description: "Taxi has been removed from the system.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Delete Failed",
				description: "Could not remove taxi.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// --- Helpers ---
	const getTaxiById = (id: string) => {
		return taxis?.find((t) => t.id === id);
	};

	return {
		// Data & Query State
		taxis,
		isLoading,
		isError,
		error,
		refetch,

		// Actions
		addTaxi: addTaxiMutation.mutateAsync,
		updateTaxi: updateTaxiMutation.mutateAsync,
		deleteTaxi: deleteTaxiMutation.mutateAsync,

		// Action States
		isAdding: addTaxiMutation.isPending,
		isUpdating: updateTaxiMutation.isPending,
		isDeleting: deleteTaxiMutation.isPending,

		// Helpers
		getTaxiById,
	};
};
