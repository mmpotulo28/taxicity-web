import { useQuery } from "@tanstack/react-query";
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
