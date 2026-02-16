import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface ActivityData {
	name: string;
	trips: number;
	revenue: number;
}

export interface RevenueBreakdownData {
	name: string;
	value: number;
	color: string;
}

export interface DashboardCharts {
	activity: ActivityData[];
	revenueBreakdown: RevenueBreakdownData[];
}

export const useDashboardCharts = () => {
	const {
		data: charts,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<DashboardCharts>({
		queryKey: ["dashboard-charts"],
		queryFn: async () => {
			const { data } = await axios.get("/api/dashboard/charts");
			return data;
		},
		// Refetch every 5 minutes
		refetchInterval: 300000,
	});

	return {
		charts,
		isLoading,
		isError,
		error,
		refetch,
	};
};
