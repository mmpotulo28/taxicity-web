"use client";
import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Button, Input, Divider, DateValue } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { DatePicker } from "@heroui/date-picker";
import { toCalendarDate, today } from "@internationalized/date";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
} from "recharts";
import { CalendarDate } from "@internationalized/date";

// Import hook
import { useReports } from "@/hooks/useReports";

const addDays = (date: DateValue, days: number): DateValue => {
	const calendarDate = toCalendarDate(date);
	const jsDate = new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day);

	jsDate.setDate(jsDate.getDate() + days);

	// Convert back to CalendarDate
	const newCalendarDate = new CalendarDate(
		jsDate.getFullYear(),
		jsDate.getMonth() + 1,
		jsDate.getDate(),
	);

	return newCalendarDate;
};

export default function ReportsPage() {
	const [selectedReport, setSelectedReport] = useState("revenue");

	const [dateRange, setDateRange] = useState<{ start: DateValue | null; end: DateValue | null }>({
		start: addDays(today("UTC"), -7), // 7 days ago
		end: today("UTC"),
	});

	// Report meta data
	const reportTypes = [
		{ key: "revenue", title: "Revenue Report", icon: "lucide:dollar-sign" },
		{ key: "drivers", title: "Drivers Performance", icon: "lucide:users" },
		{ key: "routes", title: "Route Analytics", icon: "lucide:route" },
		{ key: "trips", title: "Trip Analysis", icon: "lucide:map" },
		{ key: "feedback", title: "Feedback & Ratings", icon: "lucide:message-square" },
	];

	// Fetch real data
	const { data: reportData, isLoading: isReportLoading } = useReports();

	// Selected report configuration
	const currentReport = reportTypes.find((r) => r.key === selectedReport);

	// Sample revenue data for the chart (fallback)
	const mockRevenueData = [
		{ name: "Jan 1", revenue: 4800 },
		{ name: "Jan 2", revenue: 5200 },
		{ name: "Jan 3", revenue: 4900 },
		{ name: "Jan 4", revenue: 6100 },
		{ name: "Jan 5", revenue: 5600 },
		{ name: "Jan 6", revenue: 7200 },
		{ name: "Jan 7", revenue: 8500 },
		{ name: "Jan 8", revenue: 7800 },
		{ name: "Jan 9", revenue: 6800 },
		{ name: "Jan 10", revenue: 7400 },
	];

	const revenueData = reportData?.revenueData || mockRevenueData;
	const totalRevenue = reportData?.totalRevenue ? `R${reportData.totalRevenue.toFixed(2)}` : "R24,586.00";
	const totalTrips = reportData?.totalTrips || "1,245";

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Reports & Analytics</h1>
					<Breadcrumbs>
						<BreadcrumbItem href="/secure/dashboard">Dashboard</BreadcrumbItem>
						<BreadcrumbItem>Reports</BreadcrumbItem>
					</Breadcrumbs>
				</div>

				<div className="flex gap-2">
					<Button
						color="primary"
						startContent={<Icon icon="lucide:refresh-cw" />}
						variant="flat">
						Refresh Data
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

			{/* Report Selection */}
			<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
				{reportTypes.map((report) => (
					<Card
						key={report.key}
						isPressable
						className={selectedReport === report.key ? "border-2 border-primary" : ""}
						onPress={() => setSelectedReport(report.key)}>
						<CardBody className="p-4 flex flex-col items-center text-center">
							<div
								className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ${selectedReport === report.key ? "text-primary" : "text-default-500"}`}>
								<Icon className="text-2xl" icon={report.icon} />
							</div>
							<p className="mt-2 font-medium">{report.title}</p>
						</CardBody>
					</Card>
				))}
			</div>

			{/* Report Configuration */}
			<Card className="shadow-sm">
				<CardHeader className="pb-0">
					<div className="flex justify-between items-center w-full">
						<h2 className="text-lg font-medium flex items-center gap-2">
							<Icon
								className="text-primary"
								icon={currentReport?.icon || "lucide:file"}
							/>
							{currentReport?.title || "Report"}
						</h2>

						<div className="flex gap-2 items-center">
							<div className="text-sm text-default-500">Date Range:</div>
							<DatePicker
								className="w-48"
								value={dateRange.start}
								onChange={(date) =>
									setDateRange((prev) => ({ ...prev, start: date }))
								}
							/>
							<span>to</span>
							<DatePicker
								className="w-48"
								value={dateRange.end}
								onChange={(date) =>
									setDateRange((prev) => ({ ...prev, end: date }))
								}
							/>
						</div>
					</div>
				</CardHeader>
				<CardBody className="p-6">
					{/* Report Filters */}
					<div className="flex flex-wrap gap-4 mb-6">
						<Input
							className="w-full md:w-64"
							placeholder="Search within report..."
							startContent={
								<Icon className="text-default-400" icon="lucide:search" />
							}
						/>

						<Button startContent={<Icon icon="lucide:filter" />} variant="flat">
							Add Filters
						</Button>

						<Button startContent={<Icon icon="lucide:bar-chart" />} variant="flat">
							Customize View
						</Button>
					</div>

					<Divider className="my-4" />

					{/* Report Content - This would be different for each report type */}
					<div className="mt-6 space-y-6">
						{selectedReport === "revenue" && (
							<>
								{/* Revenue Overview Cards */}
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
									<Card>
										<CardBody className="p-4">
											<p className="text-sm text-default-500">
												Total Revenue
											</p>
											<p className="text-2xl font-bold mt-1">{totalRevenue}</p>
											<p className="text-xs text-success-600 flex items-center gap-1 mt-1">
												<Icon icon="lucide:trending-up" />
												+15% from last period
											</p>
										</CardBody>
									</Card>

									<Card>
										<CardBody className="p-4">
											<p className="text-sm text-default-500">Trip Count</p>
											<p className="text-2xl font-bold mt-1">{totalTrips}</p>
											<p className="text-xs text-success-600 flex items-center gap-1 mt-1">
												<Icon icon="lucide:trending-up" />
												+8% from last period
											</p>
										</CardBody>
									</Card>

									<Card>
										<CardBody className="p-4">
											<p className="text-sm text-default-500">Average Fare</p>
											<p className="text-2xl font-bold mt-1">R19.75</p>
											<p className="text-xs text-danger-600 flex items-center gap-1 mt-1">
												<Icon icon="lucide:trending-down" />
												-2% from last period
											</p>
										</CardBody>
									</Card>

									<Card>
										<CardBody className="p-4">
											<p className="text-sm text-default-500">Top Route</p>
											<p className="text-xl font-bold mt-1">
												Joburg to Sandton
											</p>
											<p className="text-xs text-default-500 mt-1">
												287 trips, R5,280 revenue
											</p>
										</CardBody>
									</Card>
								</div>

								{/* Revenue Chart */}
								<Card>
									<CardBody className="p-4">
										<h3 className="font-medium mb-4">Revenue Trend</h3>
										<div className="h-80">
											<ResponsiveContainer height="100%" width="100%">
												<LineChart
													data={revenueData}
													margin={{
														top: 5,
														right: 30,
														left: 20,
														bottom: 5,
													}}>
													<CartesianGrid
														opacity={0.1}
														strokeDasharray="3 3"
													/>
													<XAxis dataKey="name" />
													<YAxis />
													<Tooltip
														contentStyle={{
															backgroundColor: "var(--background)",
															borderColor: "var(--divider)",
														}}
														formatter={(value) => [
															`R${value}`,
															"Revenue",
														]}
													/>
													<Legend />
													<Line
														activeDot={{ r: 8 }}
														dataKey="revenue"
														stroke="#10B981"
														strokeWidth={2}
														type="monotone"
													/>
												</LineChart>
											</ResponsiveContainer>
										</div>
									</CardBody>
								</Card>

								{/* Revenue by Route */}
								<Card>
									<CardBody className="p-4">
										<h3 className="font-medium mb-4">Revenue by Route</h3>
										<div className="overflow-x-auto">
											<table className="min-w-full">
												<thead>
													<tr className="border-b border-divider">
														<th className="text-left py-3 px-4 text-default-500 text-sm font-medium">
															Route
														</th>
														<th className="text-left py-3 px-4 text-default-500 text-sm font-medium">
															Trips
														</th>
														<th className="text-left py-3 px-4 text-default-500 text-sm font-medium">
															Revenue
														</th>
														<th className="text-left py-3 px-4 text-default-500 text-sm font-medium">
															Avg. Fare
														</th>
														<th className="text-left py-3 px-4 text-default-500 text-sm font-medium">
															% of Total
														</th>
													</tr>
												</thead>
												<tbody>
													{/* Sample data rows */}
													<tr className="border-b border-divider">
														<td className="py-3 px-4">
															Johannesburg CBD to Sandton
														</td>
														<td className="py-3 px-4">287</td>
														<td className="py-3 px-4">R5,280.00</td>
														<td className="py-3 px-4">R18.40</td>
														<td className="py-3 px-4">21.5%</td>
													</tr>
													<tr className="border-b border-divider">
														<td className="py-3 px-4">
															Sandton to Pretoria
														</td>
														<td className="py-3 px-4">198</td>
														<td className="py-3 px-4">R4,950.00</td>
														<td className="py-3 px-4">R25.00</td>
														<td className="py-3 px-4">20.1%</td>
													</tr>
													<tr className="border-b border-divider">
														<td className="py-3 px-4">
															Johannesburg CBD to Soweto
														</td>
														<td className="py-3 px-4">245</td>
														<td className="py-3 px-4">R4,900.00</td>
														<td className="py-3 px-4">R20.00</td>
														<td className="py-3 px-4">19.9%</td>
													</tr>
												</tbody>
											</table>
										</div>
									</CardBody>
								</Card>
							</>
						)}

						{selectedReport === "drivers" && (
							<div className="space-y-6">
								<Card>
									<CardBody className="p-4">
										<h3 className="font-medium mb-4">
											Driver Performance Metrics
										</h3>
										<div className="h-80">
											<ResponsiveContainer height="100%" width="100%">
												<LineChart
													data={[
														{
															name: "Jan",
															ratings: 4.5,
															trips: 120,
															cancellations: 3,
														},
														{
															name: "Feb",
															ratings: 4.6,
															trips: 135,
															cancellations: 2,
														},
														{
															name: "Mar",
															ratings: 4.7,
															trips: 142,
															cancellations: 4,
														},
														{
															name: "Apr",
															ratings: 4.6,
															trips: 150,
															cancellations: 5,
														},
														{
															name: "May",
															ratings: 4.8,
															trips: 165,
															cancellations: 2,
														},
														{
															name: "Jun",
															ratings: 4.9,
															trips: 180,
															cancellations: 1,
														},
													]}
													margin={{
														top: 5,
														right: 30,
														left: 20,
														bottom: 5,
													}}>
													<CartesianGrid
														opacity={0.1}
														strokeDasharray="3 3"
													/>
													<XAxis dataKey="name" />
													<YAxis yAxisId="left" />
													<YAxis orientation="right" yAxisId="right" />
													<Tooltip
														contentStyle={{
															backgroundColor: "var(--background)",
															borderColor: "var(--divider)",
														}}
													/>
													<Legend />
													<Line
														activeDot={{ r: 8 }}
														dataKey="trips"
														name="Trips Completed"
														stroke="#0070F3"
														strokeWidth={2}
														type="monotone"
														yAxisId="left"
													/>
													<Line
														dataKey="cancellations"
														name="Cancellations"
														stroke="#F31260"
														strokeWidth={2}
														type="monotone"
														yAxisId="left"
													/>
													<Line
														dataKey="ratings"
														name="Avg. Rating"
														stroke="#10B981"
														strokeWidth={2}
														type="monotone"
														yAxisId="right"
													/>
												</LineChart>
											</ResponsiveContainer>
										</div>
									</CardBody>
								</Card>
							</div>
						)}

						{selectedReport === "routes" && (
							<div className="space-y-6">
								<Card>
									<CardBody className="p-4">
										<h3 className="font-medium mb-4">Route Analytics</h3>
										<div className="h-80">
											<ResponsiveContainer height="100%" width="100%">
												<LineChart
													data={[
														{
															name: "Mon",
															passengers: 450,
															taxis: 28,
															revenue: 8250,
														},
														{
															name: "Tue",
															passengers: 420,
															taxis: 26,
															revenue: 7560,
														},
														{
															name: "Wed",
															passengers: 480,
															taxis: 30,
															revenue: 8640,
														},
														{
															name: "Thu",
															passengers: 520,
															taxis: 32,
															revenue: 9360,
														},
														{
															name: "Fri",
															passengers: 650,
															taxis: 40,
															revenue: 11700,
														},
														{
															name: "Sat",
															passengers: 580,
															taxis: 36,
															revenue: 10440,
														},
														{
															name: "Sun",
															passengers: 320,
															taxis: 22,
															revenue: 5760,
														},
													]}
													margin={{
														top: 5,
														right: 30,
														left: 20,
														bottom: 5,
													}}>
													<CartesianGrid
														opacity={0.1}
														strokeDasharray="3 3"
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
													<Line
														activeDot={{ r: 8 }}
														dataKey="passengers"
														name="Passengers"
														stroke="#0070F3"
														strokeWidth={2}
														type="monotone"
													/>
													<Line
														dataKey="taxis"
														name="Taxis Operating"
														stroke="#F59E0B"
														strokeWidth={2}
														type="monotone"
													/>
													<Line
														dataKey="revenue"
														name="Revenue (R)"
														stroke="#10B981"
														strokeWidth={2}
														type="monotone"
													/>
												</LineChart>
											</ResponsiveContainer>
										</div>
									</CardBody>
								</Card>
							</div>
						)}

						{selectedReport === "trips" && (
							<div className="space-y-6">
								<Card>
									<CardBody className="p-4">
										<h3 className="font-medium mb-4">Trip Analysis</h3>
										<div className="h-80">
											<ResponsiveContainer height="100%" width="100%">
												<LineChart
													data={[
														{
															name: "6 AM",
															completed: 28,
															cancelled: 3,
															inProgress: 5,
														},
														{
															name: "8 AM",
															completed: 65,
															cancelled: 8,
															inProgress: 12,
														},
														{
															name: "10 AM",
															completed: 42,
															cancelled: 4,
															inProgress: 8,
														},
														{
															name: "12 PM",
															completed: 35,
															cancelled: 3,
															inProgress: 6,
														},
														{
															name: "2 PM",
															completed: 48,
															cancelled: 5,
															inProgress: 9,
														},
														{
															name: "4 PM",
															completed: 72,
															cancelled: 10,
															inProgress: 15,
														},
														{
															name: "6 PM",
															completed: 91,
															cancelled: 12,
															inProgress: 18,
														},
														{
															name: "8 PM",
															completed: 56,
															cancelled: 7,
															inProgress: 11,
														},
														{
															name: "10 PM",
															completed: 32,
															cancelled: 5,
															inProgress: 6,
														},
													]}
													margin={{
														top: 5,
														right: 30,
														left: 20,
														bottom: 5,
													}}>
													<CartesianGrid
														opacity={0.1}
														strokeDasharray="3 3"
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
													<Line
														activeDot={{ r: 8 }}
														dataKey="completed"
														name="Completed"
														stroke="#10B981"
														strokeWidth={2}
														type="monotone"
													/>
													<Line
														dataKey="cancelled"
														name="Cancelled"
														stroke="#F31260"
														strokeWidth={2}
														type="monotone"
													/>
													<Line
														dataKey="inProgress"
														name="In Progress"
														stroke="#F59E0B"
														strokeWidth={2}
														type="monotone"
													/>
												</LineChart>
											</ResponsiveContainer>
										</div>
									</CardBody>
								</Card>
							</div>
						)}

						{selectedReport === "feedback" && (
							<div className="space-y-6">
								<Card>
									<CardBody className="p-4">
										<h3 className="font-medium mb-4">
											Customer Ratings & Feedback
										</h3>
										<div className="h-80">
											<ResponsiveContainer height="100%" width="100%">
												<LineChart
													data={[
														{
															name: "Week 1",
															driverRating: 4.2,
															appRating: 4.0,
															complaints: 12,
														},
														{
															name: "Week 2",
															driverRating: 4.3,
															appRating: 4.1,
															complaints: 10,
														},
														{
															name: "Week 3",
															driverRating: 4.4,
															appRating: 4.2,
															complaints: 8,
														},
														{
															name: "Week 4",
															driverRating: 4.5,
															appRating: 4.3,
															complaints: 6,
														},
														{
															name: "Week 5",
															driverRating: 4.6,
															appRating: 4.5,
															complaints: 5,
														},
														{
															name: "Week 6",
															driverRating: 4.7,
															appRating: 4.6,
															complaints: 3,
														},
													]}
													margin={{
														top: 5,
														right: 30,
														left: 20,
														bottom: 5,
													}}>
													<CartesianGrid
														opacity={0.1}
														strokeDasharray="3 3"
													/>
													<XAxis dataKey="name" />
													<YAxis domain={[0, 5]} yAxisId="left" />
													<YAxis orientation="right" yAxisId="right" />
													<Tooltip
														contentStyle={{
															backgroundColor: "var(--background)",
															borderColor: "var(--divider)",
														}}
													/>
													<Legend />
													<Line
														activeDot={{ r: 8 }}
														dataKey="driverRating"
														name="Driver Rating"
														stroke="#0070F3"
														strokeWidth={2}
														type="monotone"
														yAxisId="left"
													/>
													<Line
														dataKey="appRating"
														name="App Rating"
														stroke="#10B981"
														strokeWidth={2}
														type="monotone"
														yAxisId="left"
													/>
													<Line
														dataKey="complaints"
														name="Complaints"
														stroke="#F31260"
														strokeWidth={2}
														type="monotone"
														yAxisId="right"
													/>
												</LineChart>
											</ResponsiveContainer>
										</div>
									</CardBody>
								</Card>
							</div>
						)}
					</div>
				</CardBody>
			</Card>

			<div className="flex justify-between">
				<Button startContent={<Icon icon="lucide:save" />} variant="flat">
					Save Report Settings
				</Button>

				<Button color="primary" startContent={<Icon icon="lucide:mail" />}>
					Schedule Report
				</Button>
			</div>
		</div>
	);
}
