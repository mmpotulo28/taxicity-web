import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Route } from "@taxicity/database";

export const useRoutes = () => {
	return useQuery<Route[]>({
		queryKey: ["routes"],
		queryFn: async () => {
			const { data } = await axios.get("/api/routes");
			return data;
		},
	});
};
