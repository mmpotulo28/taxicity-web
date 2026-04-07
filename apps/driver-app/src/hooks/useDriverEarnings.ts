import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api-client";

export interface DriverTripEarning {
	id: string;
	endTime: string;
	route: {
		name: string;
	};
	passengers: number;
	totalAmount: number;
}

export interface DriverEarningStats {
	total: number;
	today: number;
	week: number;
	month: number;
	amountDue?: number;
	trips: DriverTripEarning[];
}

const ROWS_PER_PAGE = 5;

export function formatCurrency(value: number) {
	return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 2 }).format(value);
}

export function useDriverEarnings() {
	const [stats, setStats] = useState<DriverEarningStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);

	const fetchEarnings = useCallback(async () => {
		try {
			const data = await apiGet<DriverEarningStats>("/api/driver/earnings");
			setStats(data);
		} catch {
			setStats(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchEarnings();
	}, [fetchEarnings]);

	const trips = useMemo(() => stats?.trips ?? [], [stats]);
	const totalPages = useMemo(() => Math.max(1, Math.ceil(trips.length / ROWS_PER_PAGE)), [trips.length]);
	const pagedTrips = useMemo(() => {
		const start = (page - 1) * ROWS_PER_PAGE;
		const end = start + ROWS_PER_PAGE;
		return trips.slice(start, end);
	}, [page, trips]);

	const cards = useMemo(
		() => [
			{ label: "Fees Due", value: formatCurrency(stats?.amountDue ?? 0), icon: "credit-card-fast-outline" as const, color: "#ef4444" },
			{ label: "Today", value: formatCurrency(stats?.today ?? 0), icon: "calendar-today" as const, color: "#3b82f6" },
			{ label: "This Week", value: formatCurrency(stats?.week ?? 0), icon: "calendar-week" as const, color: "#22c55e" },
			{ label: "This Month", value: formatCurrency(stats?.month ?? 0), icon: "calendar-month" as const, color: "#f59e0b" },
			{ label: "Total Earnings", value: formatCurrency(stats?.total ?? 0), icon: "chart-box-outline" as const, color: "#8b5cf6" },
		],
		[stats],
	);

	const goPreviousPage = useCallback(() => setPage((current) => Math.max(1, current - 1)), []);
	const goNextPage = useCallback(() => setPage((current) => Math.min(totalPages, current + 1)), [totalPages]);

	return {
		stats,
		loading,
		page,
		trips,
		totalPages,
		pagedTrips,
		cards,
		goPreviousPage,
		goNextPage,
	};
}
