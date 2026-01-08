import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface ReportData {
	revenueData: { name: string; revenue: number }[];
	totalRevenue: number;
	totalTrips: number;
}

export const useReports = () => {
	return useQuery<ReportData>({
		queryKey: ["reports"],
		queryFn: async () => {
			const { data } = await axios.get("/api/reports");
			return data;
		},
	});
};
