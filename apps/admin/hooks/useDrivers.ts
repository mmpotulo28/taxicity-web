import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Driver } from "@taxiciti/database/types";
import { addToast } from "@heroui/toast";

export const useDrivers = () => {
	const queryClient = useQueryClient();

	// --- Queries ---
	const {
		data: drivers,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<Driver[]>({
		queryKey: ["drivers"],
		queryFn: async () => {
			const { data } = await axios.get("/api/drivers");
			return data;
		},
	});

	// --- Mutations ---

	// Create Driver
	const createDriverMutation = useMutation({
		mutationFn: async (newDriver: Partial<Driver>) => {
			const { data } = await axios.post("/api/drivers", newDriver);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["drivers"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			addToast({
				title: "Driver Created",
				description: "New driver has been successfully registered.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Error",
				description: "Failed to create driver. Please try again.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// Update Driver
	const updateDriverMutation = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<Driver> }) => {
			const { data: response } = await axios.patch(`/api/drivers/${id}`, data);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["drivers"] });
			addToast({
				title: "Driver Updated",
				description: "Driver details have been updated.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Update Failed",
				description: "Could not update driver details.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// Delete Driver
	const deleteDriverMutation = useMutation({
		mutationFn: async (id: string) => {
			await axios.delete(`/api/drivers/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["drivers"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
			addToast({
				title: "Driver Deleted",
				description: "Driver has been removed from the system.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Delete Failed",
				description: "Could not remove driver.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// --- Helpers ---
	const getDriverById = (id: string) => {
		return drivers?.find((d) => d.id === id);
	};

	return {
		// Data & Query State
		drivers,
		isLoading,
		isError,
		error,
		refetch,

		// Actions
		createDriver: createDriverMutation.mutateAsync,
		updateDriver: updateDriverMutation.mutateAsync,
		deleteDriver: deleteDriverMutation.mutateAsync,

		// Action States
		isCreating: createDriverMutation.isPending,
		isUpdating: updateDriverMutation.isPending,
		isDeleting: deleteDriverMutation.isPending,

		// Helpers
		getDriverById,
	};
};
