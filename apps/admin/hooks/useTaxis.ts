import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Taxi } from "@taxicity/database";

export const useTaxis = () => {
	return useQuery<Taxi[]>({
		queryKey: ["taxis"],
		queryFn: async () => {
			const { data } = await axios.get("/api/taxis");
			return data;
		},
	});
};
