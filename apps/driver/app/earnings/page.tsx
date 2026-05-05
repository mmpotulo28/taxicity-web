"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { formatCurrency } from "@taxiciti/utils";
import { Icon } from "@iconify/react";
import { Pagination } from "@heroui/pagination";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { useAuth } from "@clerk/nextjs";
import { apiGet } from "@/lib/api-client";

const CLERK_TOKEN_TEMPLATE = "taxiciti_api";

interface Trip {
	id: string;
	startTime: string;
	endTime: string;
	route: {
		name: string;
	};
	fare: number;
	passengers: number;
	totalAmount: number;
}

interface EarningStats {
	total: number;
	today: number;
	week: number;
	month: number;
	amountDue?: number;
	trips: Trip[];
}

export default function DriverEarningsPage() {
	const { isLoaded, isSignedIn, getToken } = useAuth();
	const [stats, setStats] = useState<EarningStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const rowsPerPage = 5;

	const fetchEarnings = useCallback(async () => {
		try {
			const token = await getToken({ template: CLERK_TOKEN_TEMPLATE });
			const headers: HeadersInit | undefined = token ? { Authorization: `Bearer ${token}` } : undefined;
			const data = await apiGet<EarningStats>("/api/driver/earnings", { headers });
			setStats(data);
		} catch (error) {
			console.error("Failed to fetch earnings:", error);
		} finally {
			setLoading(false);
		}
	}, [getToken]);

	useEffect(() => {
		if (!isLoaded) {
			return;
		}

		if (!isSignedIn) {
			setLoading(false);
			return;
		}

		void fetchEarnings();
	}, [fetchEarnings, isLoaded, isSignedIn]);

	const trips = useMemo(() => stats?.trips || [], [stats]);

	const items = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		const end = start + rowsPerPage;

		return trips.slice(start, end);
	}, [page, trips]);

	const totalPages = Math.ceil(trips.length / rowsPerPage);

	if (loading) {
		return (
			<div className='flex justify-center items-center h-[calc(100vh-100px)]'>
				<Spinner size='lg' color='primary' label='Loading earnings...' />
			</div>
		);
	}

	if (!stats) {
		return (
			<div className='flex flex-col items-center justify-center h-[50vh] gap-4'>
				<Icon icon='solar:danger-circle-bold-duotone' className='text-4xl text-danger' />
				<p className='text-center text-default-500'>Failed to load earnings data.</p>
			</div>
		);
	}

	return (
		<div className='h-full flex flex-col gap-6 p-4 w-full pb-24'>
			<div className='flex items-center gap-2'>
				<div className='p-2 bg-primary/10 rounded-lg text-primary'>
					<Icon icon='solar:wallet-money-bold-duotone' width={24} />
				</div>
				<div>
					<h1 className='text-xl font-bold'>Earnings Dashboard</h1>
					<p className='text-xs text-default-500'>Track your income and trip history</p>
				</div>
			</div>

			{/* Summary Cards */}
			<div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
				<StatsCard title='Fees Due' value={stats.amountDue || 0} icon='solar:card-transfer-bold-duotone' color='danger' />
				<StatsCard title='Today' value={stats.today} icon='solar:calendar-today-bold-duotone' color='primary' />
				<StatsCard title='This Week' value={stats.week} icon='solar:calendar-week-bold-duotone' color='success' />
				<StatsCard title='This Month' value={stats.month} icon='solar:calendar-date-bold-duotone' color='warning' />
				<StatsCard title='Total Earnings' value={stats.total} icon='solar:chart-square-bold-duotone' color='secondary' />
			</div>

			{/* Recent Trips Section */}
			<Card className='flex-1 shadow-sm border border-default-100'>
				<CardHeader className='flex justify-between items-center px-4 py-3'>
					<div className='flex items-center gap-2'>
						<Icon icon='solar:history-bold-duotone' className='text-default-500' width={20} />
						<h2 className='font-semibold text-default-700'>Trip History</h2>
					</div>
					<Chip size='sm' variant='flat' color='primary'>
						{trips.length} Total Trips
					</Chip>
				</CardHeader>
				<Divider />
				<CardBody className='p-0 overflow-hidden bg-content1'>
					{trips.length === 0 ? (
						<div className='flex flex-col items-center justify-center py-12 gap-3 text-default-400'>
							<Icon icon='solar:folder-open-bold-duotone' width={48} />
							<p>No completed trips yet.</p>
						</div>
					) : (
						<>
							<ScrollShadow className='h-[400px] w-full'>
								<div className='divide-y divide-default-100'>
									{items.map((trip) => (
										<div key={trip.id} className='p-4 hover:bg-default-50 transition-colors flex justify-between items-center group'>
											<div className='flex gap-3 items-center'>
												<div className='w-10 h-10 rounded-full bg-default-100 flex items-center justify-center text-default-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors'>
													<Icon icon='solar:route-bold-duotone' width={20} />
												</div>
												<div className='flex flex-col'>
													<span className='text-sm font-semibold text-default-900'>{trip.route.name}</span>
													<div className='flex items-center gap-2 mt-0.5'>
														<span className='text-[10px] text-default-500 flex items-center gap-1'>
															<Icon icon='solar:calendar-linear' width={10} />
															{new Date(trip.endTime).toLocaleDateString()}
														</span>
														<span className='w-1 h-1 rounded-full bg-default-300'></span>
														<span className='text-[10px] text-default-500 flex items-center gap-1'>
															<Icon icon='solar:clock-circle-linear' width={10} />
															{new Date(trip.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
														</span>
													</div>
												</div>
											</div>

											<div className='flex flex-col items-end gap-1'>
												<span className='font-bold text-success text-base'>{formatCurrency(trip.totalAmount)}</span>
												<div className='flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-default-100'>
													<Icon icon='solar:users-group-rounded-bold' className='text-default-500' width={12} />
													<span className='text-[10px] font-medium text-default-600'>{trip.passengers}</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</ScrollShadow>

							{totalPages > 1 && (
								<div className='p-4 flex justify-center border-t border-default-100'>
									<Pagination isCompact showControls total={totalPages} page={page} onChange={setPage} color='primary' variant='light' />
								</div>
							)}
						</>
					)}
				</CardBody>
			</Card>
		</div>
	);
}

// Helper Component for Stats
function StatsCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: "primary" | "secondary" | "success" | "warning" | "danger" }) {
	const colorMap = {
		primary: "bg-primary/10 text-primary",
		secondary: "bg-secondary/10 text-secondary",
		success: "bg-success/10 text-success",
		warning: "bg-warning/10 text-warning",
		danger: "bg-danger/10 text-danger",
	};

	return (
		<Card className='shadow-sm border border-default-100'>
			<CardBody className='p-4 flex flex-col gap-2'>
				<div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]} mb-1`}>
					<Icon icon={icon} width={18} />
				</div>
				<div>
					<p className='text-xs text-default-500 font-medium'>{title}</p>
					<p className='text-lg font-bold text-default-900 truncate'>{formatCurrency(value)}</p>
				</div>
			</CardBody>
		</Card>
	);
}
