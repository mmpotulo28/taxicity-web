"use client";
import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Icon } from "@iconify/react";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { useRouter } from "next/navigation";
import {
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useDashboardCharts } from "@/hooks/useDashboardCharts";
import { useTrips } from "@/hooks/useTrips";
import { DashboardStatsGrid, DashboardStatProps } from "@/components/dashboard/DashboardStats";
import { TripActivityChart, RevenueBreakdownChart } from "@/components/dashboard/Charts";

export default function Dashboard() {
	const router = useRouter();


	// Use the real data hook
	const { stats, isLoading: isStatsLoading, refetch: refetchStats } = useDashboardStats();
	const { charts, isLoading: isChartsLoading, refetch: refetchCharts } = useDashboardCharts();
	const { trips: recentTrips, isLoading: isTripsLoading } = useTrips();
	const [isRefreshing, setIsRefreshing] = useState(false);

	const isLoading = isStatsLoading || isChartsLoading || isRefreshing;

	const [timeRange, setTimeRange] = useState("today");

	// Removed local simulation of chart data

	// Default values if data is loading or undefined
	const activeTrips = stats?.activeTrips || 0;
	const pendingApprovals = stats?.pendingApprovals || 0;
	const availableTaxis = stats?.availableTaxis || 0;
	const todayRevenue = stats?.todayRevenue ? `R${Number(stats.todayRevenue).toFixed(2)}` : "R0.00";

	// Use real chart data from the hook
	const tripActivityData = charts?.activity || [];
	const revenueBreakdownData = charts?.revenueBreakdown || [];

	const dashboardStats: DashboardStatProps[] = [
		{ title: "Active Trips", value: activeTrips, icon: "lucide:car", color: "primary", change: "+12.5%" },
		{ title: "Available Taxis", value: availableTaxis, icon: "lucide:check-circle", color: "success", change: "+5.3%" },
		{ title: "Today's Revenue", value: todayRevenue, icon: "lucide:dollar-sign", color: "warning", change: "+8.1%" },
		{ title: "Pending Approvals", value: pendingApprovals, icon: "lucide:alert-circle", color: "danger", change: "-2.4%" },
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Dashboard</h1>
					<Breadcrumbs>
						<BreadcrumbItem>Admin</BreadcrumbItem>
						<BreadcrumbItem>Dashboard</BreadcrumbItem>
					</Breadcrumbs>
				</div>

				<div className="flex gap-2">
					<Button
						color="primary"
						isLoading={isLoading}
						startContent={<Icon icon="lucide:refresh-cw" />}
						variant="flat"
						onPress={() => {
							setIsRefreshing(true);
							Promise.all([refetchStats(), refetchCharts()]).finally(() => {
								setTimeout(() => setIsRefreshing(false), 800);
							});
						}}>
						Refresh
					</Button>

					<Dropdown>
						<DropdownTrigger>
							<Button
								color="primary"
								endContent={<Icon icon="lucide:chevron-down" />}>
								Export
							</Button>
						</DropdownTrigger>
						<DropdownMenu aria-label="Export options">
							<DropdownItem key="pdf" startContent={<Icon icon="lucide:file" />}>
								Export as PDF
							</DropdownItem>
							<DropdownItem
								key="excel"
								startContent={<Icon icon="lucide:file-spreadsheet" />}>
								Export as Excel
							</DropdownItem>
							<DropdownItem key="csv" startContent={<Icon icon="lucide:file-text" />}>
								Export as CSV
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			</div>

			{/* Stats Cards */}
			<DashboardStatsGrid stats={dashboardStats} isLoading={isLoading} />

			{/* Time Range Selector */}
			<div className="flex justify-end">
				<Tabs
					aria-label="Time Range"
					color="primary"
					selectedKey={timeRange}
					size="sm"
					onSelectionChange={(key) => setTimeRange(key as string)}>
					<Tab key="today" title="Today" />
					<Tab key="week" title="This Week" />
					<Tab key="month" title="This Month" />
					<Tab key="year" title="This Year" />
				</Tabs>
			</div>

			{/* Charts and Data Section */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Trip Activity Chart */}
				<Card className="lg:col-span-2">
					<CardHeader className="flex justify-between items-center pb-0">
						<h2 className="text-lg font-medium">Trip Activity</h2>
						<Dropdown>
							<DropdownTrigger>
								<Button size="sm" variant="light">
									<Icon icon="lucide:more-horizontal" />
								</Button>
							</DropdownTrigger>
							<DropdownMenu aria-label="Chart options">
								<DropdownItem key="download">Download Chart</DropdownItem>
								<DropdownItem key="fullscreen">View Fullscreen</DropdownItem>
								<DropdownItem key="refresh">Refresh Data</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</CardHeader>
					<CardBody className="p-4">
						{isLoading ? (
							<div className="h-64 bg-default-100 rounded-lg animate-pulse flex items-center justify-center">
								<Icon
									className="text-4xl text-default-300"
									icon="lucide:loader-2"
								/>
							</div>
						) : (
							<div className="h-64">
								<TripActivityChart data={tripActivityData} />
							</div>
						)}
					</CardBody>
				</Card>

				{/* Revenue Breakdown */}
				<Card>
					<CardHeader className="pb-0">
						<h2 className="text-lg font-medium">Revenue Breakdown</h2>
					</CardHeader>
					<CardBody className="p-4">
						{isLoading ? (
							<div className="h-64 bg-default-100 rounded-lg animate-pulse flex items-center justify-center">
								<Icon
									className="text-4xl text-default-300"
									icon="lucide:loader-2"
								/>
							</div>
						) : (
							<div className="h-64">
								<RevenueBreakdownChart data={revenueBreakdownData} />
							</div>
						)}
					</CardBody>
				</Card>
			</div>

			{/* Recent Activity Table */}
			<Card>
				<CardHeader className="pb-0 flex justify-between">
					<h2 className="text-lg font-medium">Recent Activity</h2>
					<Button
						color="primary"
						size="sm"
						variant="flat"
						onPress={() => router.push("/secure/dashboard/trips")}>
						View All
					</Button>
				</CardHeader>
				<CardBody className="p-4">
					{isTripsLoading ? (
						<div className="space-y-4">
							{Array.from({ length: 5 }).map((_, i) => (
								<div
									key={i}
									className="h-12 bg-default-100 rounded-md animate-pulse" />
							))}
						</div>
					) : (
						<table className="min-w-full">
							<thead>
								<tr className="border-b border-divider">
									<th className="text-left py-3 text-default-500 text-sm font-medium">
										Event
									</th>
									<th className="text-left py-3 text-default-500 text-sm font-medium">
										User
									</th>
									<th className="text-left py-3 text-default-500 text-sm font-medium">
										Route
									</th>
									<th className="text-left py-3 text-default-500 text-sm font-medium">
										Time
									</th>
									<th className="text-left py-3 text-default-500 text-sm font-medium">
										Status
									</th>
								</tr>
							</thead>
							<tbody>
								{recentTrips?.slice(0, 5).map((trip) => (
									<tr
										key={trip.id}
										className="border-b border-divider hover:bg-default-50 transition-colors">
										<td className="py-3">
											Trip{" "}
											{trip.status.charAt(0).toUpperCase() + trip.status.slice(1).toLowerCase()}
										</td>
										<td className="py-3">
											Customer #{trip.userId.slice(0, 6)}...
										</td>
										<td className="py-3">{trip.route.name}</td>
										<td className="py-3">
											{new Date(trip.createdAt).toLocaleString(undefined, {
												month: "short",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</td>
										<td className="py-3">
											<span
												className={`px-2 py-1 rounded-full text-xs ${trip.status === "COMPLETED"
													? "bg-success-100 text-success-600"
													: trip.status === "CANCELLED"
														? "bg-danger-100 text-danger-600"
														: "bg-warning-100 text-warning-600"
													}`}>
												{trip.status}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}

					<div className="mt-4 flex justify-between items-center">
						<p className="text-sm text-default-500">
							Showing <span className="font-medium">{Math.min(5, recentTrips?.length || 0)}</span> of{" "}
							<span className="font-medium">{recentTrips?.length || 0}</span> activities
						</p>

						<div className="flex gap-2">
							<Button size="sm" variant="flat">
								<Icon icon="lucide:chevron-left" />
							</Button>
							<Button size="sm" variant="flat">
								<Icon icon="lucide:chevron-right" />
							</Button>
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Quick Actions Section */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card
					isPressable
					className="shadow-sm"
					onPress={() => router.push("/secure/dashboard/drivers")}>
					<CardBody className="p-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
								<Icon className="text-primary" icon="lucide:user-plus" />
							</div>
							<div>
								<h3 className="font-medium">Add New Driver</h3>
								<p className="text-xs text-default-500">
									Register and approve new drivers
								</p>
							</div>
						</div>
					</CardBody>
				</Card>

				<Card
					isPressable
					className="shadow-sm"
					onPress={() => router.push("/secure/dashboard/taxis")}>
					<CardBody className="p-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
								<Icon className="text-success" icon="lucide:car" />
							</div>
							<div>
								<h3 className="font-medium">Register Taxi</h3>
								<p className="text-xs text-default-500">
									Add new taxis to the system
								</p>
							</div>
						</div>
					</CardBody>
				</Card>

				<Card
					isPressable
					className="shadow-sm"
					onPress={() => router.push("/secure/dashboard/routes")}>
					<CardBody className="p-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
								<Icon className="text-warning" icon="lucide:route" />
							</div>
							<div>
								<h3 className="font-medium">Manage Routes</h3>
								<p className="text-xs text-default-500">
									Create and update taxi routes
								</p>
							</div>
						</div>
					</CardBody>
				</Card>

				<Card
					isPressable
					className="shadow-sm"
					onPress={() => router.push("/secure/dashboard/reports")}>
					<CardBody className="p-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center">
								<Icon className="text-danger" icon="lucide:file-bar-chart" />
							</div>
							<div>
								<h3 className="font-medium">Generate Reports</h3>
								<p className="text-xs text-default-500">
									Create detailed analytics reports
								</p>
							</div>
						</div>
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
