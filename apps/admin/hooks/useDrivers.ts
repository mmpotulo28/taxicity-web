import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Driver } from "@taxicity/database";

export const useDrivers = () => {
	return useQuery<Driver[]>({
		queryKey: ["drivers"],
		queryFn: async () => {
			const { data } = await axios.get("/api/drivers");
			return data;
		},
	});
};

export const useCreateDriver = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (newDriver: Partial<Driver>) => {
			const { data } = await axios.post("/api/drivers", newDriver);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["drivers"] });
		},
	});
};

export const useUpdateDriver = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<Driver> }) => {
			const { data: response } = await axios.patch(`/api/drivers/${id}`, data);
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["drivers"] });
		},
	});
};

export const useDeleteDriver = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			await axios.delete(`/api/drivers/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["drivers"] });
		},
	});
};
