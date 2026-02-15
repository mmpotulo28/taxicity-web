import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Rank } from "@taxiciti/database/types";
import { addToast } from "@heroui/toast";

// Extended Rank type with relations returned by the API
export type RankWithRelations = Rank & {
	_count?: {
		taxiRanks: number;
		sourceRoutes: number;
		queueEntries: number;
		trips: number;
	};
	sourceRoutes?: Array<{
		id: string;
		name: string;
		distance: number;
		estimatedDuration: number;
		baseFare: number;
	}>;
	taxiRanks?: any[];
	queueEntries?: any[];
};

export const useRanks = () => {
	const queryClient = useQueryClient();

	// --- Queries ---
	const {
		data: ranks,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<RankWithRelations[]>({
		queryKey: ["ranks"],
		queryFn: async () => {
			const { data } = await axios.get("/api/ranks");
			return data;
		},
	});

	// --- Mutations ---

	// Create Rank
	const createRankMutation = useMutation({
		mutationFn: async (newRank: Partial<Rank>) => {
			const { data } = await axios.post("/api/ranks", newRank);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ranks"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			addToast({
				title: "Rank Created",
				description: "New rank has been successfully created.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Error",
				description: "Failed to create rank. Please try again.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// Update Rank
	const updateRankMutation = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<Rank> }) => {
			const response = await axios.patch(`/api/ranks/${id}`, data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ranks"] });
			addToast({
				title: "Rank Updated",
				description: "Rank details have been updated.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Update Failed",
				description: "Could not update rank details.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// Delete Rank
	const deleteRankMutation = useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.delete(`/api/ranks/${id}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ranks"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			addToast({
				title: "Rank Deleted",
				description: "Rank has been removed from the system.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Delete Failed",
				description: "Could not remove rank.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// --- Helpers ---
	const getRankById = (id: string) => {
		return ranks?.find((r) => r.id === id);
	};

	return {
		// Data & Query State
		ranks,
		isLoading,
		isError,
		error,
		refetch,

		// Actions
		createRank: createRankMutation.mutateAsync,
		updateRank: updateRankMutation.mutateAsync,
		deleteRank: deleteRankMutation.mutateAsync,

		// Action States
		isCreating: createRankMutation.isPending,
		isUpdating: updateRankMutation.isPending,
		isDeleting: deleteRankMutation.isPending,

		// Helpers
		getRankById,
	};
};
