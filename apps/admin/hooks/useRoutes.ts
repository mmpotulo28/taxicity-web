import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Route, Rank } from "@taxicity/database";

export type RouteWithRanks = Route & {
	sourceRank: Rank;
	destRank: Rank;
};

export const useRoutes = () => {
	return useQuery<RouteWithRanks[]>({
		queryKey: ["routes"],
		queryFn: async () => {
			const { data } = await axios.get("/api/routes");
			return data;
		},
	});
};
