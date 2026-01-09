import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Rank } from "@taxicity/database";

export const useRanks = () => {
	return useQuery<Rank[]>({
		queryKey: ["ranks"],
		queryFn: async () => {
			const { data } = await axios.get("/api/ranks");
			return data;
		},
	});
};

export const useCreateRank = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (newRank: Partial<Rank>) => {
			const { data } = await axios.post("/api/ranks", newRank);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ranks"] });
		},
	});
};

export const useUpdateRank = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, ...data }: Partial<Rank> & { id: string }) => {
			const response = await axios.patch(`/api/ranks/${id}`, data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ranks"] });
		},
	});
};

export const useDeleteRank = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await axios.delete(`/api/ranks/${id}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ranks"] });
		},
	});
};
