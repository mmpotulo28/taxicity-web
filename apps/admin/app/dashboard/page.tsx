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
import { trips as tripHistory } from "@/lib/data";

export default function Dashboard() {
	const router = useRouter();


	// Use the real data hook
	const { data: stats, isLoading: isStatsLoading, refetch } = useDashboardStats();
	const [isRefreshing, setIsRefreshing] = useState(false);

	const isLoading = isStatsLoading || isRefreshing;

	const [timeRange, setTimeRange] = useState("today");
	const [tripActivityData, setTripActivityData] = useState<
		{
			name: string;
			trips: number;
			revenue: number;
		}[]
	>([]);
	const [revenueBreakdownData, setRevenueBreakdownData] = useState<
		{
			name: string;
			value: number;
			color: string;
		}[]
	>([]);

	useEffect(() => {
		// Only chart data is simulated now
		const generateChartData = () => {
			// Generate trip activity data for the chart
			const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
			const activityData = daysOfWeek.map((day) => ({
				name: day,
				trips: Math.floor(Math.random() * 80) + 20,
				revenue: Math.floor(Math.random() * 5000) + 1000,
			}));

			setTripActivityData(activityData);

			// Generate revenue breakdown data for pie chart
			const breakdownData = [
				{ name: "Cash", value: 45, color: "#0070F3" },
				{ name: "QR Code", value: 35, color: "#10B981" },
				{ name: "Mobile", value: 20, color: "#F59E0B" },
			];

			setRevenueBreakdownData(breakdownData);
		};

		generateChartData();
	}, []);

	// Default values if data is loading or undefined
	const activeTrips = stats?.activeTrips || 0;
	const pendingApprovals = stats?.pendingApprovals || 0;
	const availableTaxis = stats?.availableTaxis || 0;
	const todayRevenue = stats?.todayRevenue ? `R${Number(stats.todayRevenue).toFixed(2)}` : "R0.00";

	const StatCard = ({
		title,
		value,
		icon,
		color,
		change,
		loading = isLoading,
	}: {
		title: string;
		value: string | number;
		icon: string;
		color: string;
		change?: string;
		loading?: boolean;
	}) => (
		<Card className="shadow-sm">
			<CardBody className="p-4">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-default-500">{title}</p>
						{loading ? (
							<div className="h-8 w-24 bg-default-100 rounded-md animate-pulse mt-1" />
						) : (
							<p className="text-2xl font-bold mt-1">{value}</p>
						)}
						{!loading && change && (
							<p
								className={`text-xs flex items-center gap-1 mt-1 ${change.startsWith("+") ? "text-success-600" : "text-danger-600"
									}`}>
								<Icon
									icon={
										change.startsWith("+")
											? "lucide:trending-up"
											: "lucide:trending-down"
									}
								/>
								{change} from yesterday
							</p>
						)}
					</div>
					<div
						className={`w-12 h-12 rounded-full bg-${color}/20 flex items-center justify-center`}>
						<Icon className={`text-${color} text-2xl`} icon={icon} />
					</div>
				</div>
			</CardBody>
		</Card>
	);

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
							refetch().finally(() => {
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
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					change="+12.5%"
					color="primary"
					icon="lucide:car"
					title="Active Trips"
					value={activeTrips}
				/>
				<StatCard
					change="+5.3%"
					color="success"
					icon="lucide:check-circle"
					title="Available Taxis"
					value={availableTaxis}
				/>
				<StatCard
					change="+8.1%"
					color="warning"
					icon="lucide:dollar-sign"
					title="Today's Revenue"
					value={todayRevenue}
				/>
				<StatCard
					change="-2.4%"
					color="danger"
					icon="lucide:alert-circle"
					title="Pending Approvals"
					value={pendingApprovals}
				/>
			</div>

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
								<ResponsiveContainer height="100%" width="100%">
									<BarChart
										data={tripActivityData}
										margin={{
											top: 10,
											right: 30,
											left: 0,
											bottom: 0,
										}}>
										<CartesianGrid
											opacity={0.1}
											strokeDasharray="3 3"
											vertical={false}
										/>
										<XAxis dataKey="name" />
										<YAxis />
										<Tooltip
											contentStyle={{
												backgroundColor: "var(--background)",
												borderColor: "var(--divider)",
											}}
										/>
										<Legend />
										<Bar
											dataKey="trips"
											fill="#0070F3"
											name="Trip Count"
											radius={[4, 4, 0, 0]}
										/>
									</BarChart>
								</ResponsiveContainer>
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
								<ResponsiveContainer height="100%" width="100%">
									<PieChart>
										<Pie
											cx="50%"
											cy="45%"
											data={revenueBreakdownData}
											dataKey="value"
											fill="#8884d8"
											innerRadius={60}
											label={({ name, percent }) =>
												`${name} ${(percent * 100).toFixed(0)}%`
											}
											outerRadius={80}
											paddingAngle={5}>
											{revenueBreakdownData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Pie>
										<Tooltip
											contentStyle={{
												backgroundColor: "var(--background)",
												borderColor: "var(--divider)",
											}}
										/>
										<Legend
											align="center"
											layout="horizontal"
											verticalAlign="bottom"
										/>
									</PieChart>
								</ResponsiveContainer>
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
					{isLoading ? (
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
								{tripHistory.slice(0, 5).map((trip, index) => (
									<tr
										key={index}
										className="border-b border-divider hover:bg-default-50 transition-colors">
										<td className="py-3">
											Trip{" "}
											{trip.status === "completed"
												? "Completed"
												: "Cancelled"}
										</td>
										<td className="py-3">
											Customer #{Math.floor(Math.random() * 1000) + 1000}
										</td>
										<td className="py-3">{trip.route}</td>
										<td className="py-3">{trip.time}</td>
										<td className="py-3">
											<span
												className={`px-2 py-1 rounded-full text-xs ${trip.status === "completed"
													? "bg-success-100 text-success-600"
													: "bg-danger-100 text-danger-600"
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
							Showing <span className="font-medium">5</span> of{" "}
							<span className="font-medium">{tripHistory.length}</span> activities
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
