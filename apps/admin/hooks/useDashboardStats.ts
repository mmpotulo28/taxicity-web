import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface DashboardStats {
	availableTaxis: number;
	activeTrips: number;
	pendingApprovals: number;
	todayRevenue: number;
}

export const useDashboardStats = () => {
	const {
		data: stats,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<DashboardStats>({
		queryKey: ["dashboard-stats"],
		queryFn: async () => {
			const { data } = await axios.get("/api/dashboard/stats");
			return data;
		},
		// Refetch every minute
		refetchInterval: 60000,
	});

	return {
		stats,
		isLoading,
		isError,
		error,
		refetch,
	};
};
