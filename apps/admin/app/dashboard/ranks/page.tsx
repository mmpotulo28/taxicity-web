"use client";
import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Table,
	TableHeader,
	TableBody,
	TableColumn,
	TableRow,
	TableCell,
	Breadcrumbs,
	BreadcrumbItem,
	Button,
	Chip,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Input,
	Pagination,
	useDisclosure,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Tabs,
	Tab,
	Progress,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/toast";
import { useRanks } from "@/hooks/useRanks";
import { useTaxis } from "@/hooks/useTaxis";
import { useRoutes } from "@/hooks/useRoutes";
import { Rank, Route } from "@taxicity/database";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine,
} from "recharts";

export default function RanksPage() {
	const { data: ranks, isLoading } = useRanks();
	const { data: taxis = [] } = useTaxis();
	const { data: routes = [] } = useRoutes();
	const [filteredRanks, setFilteredRanks] = useState<any[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [regionFilter, setRegionFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedRank, setSelectedRank] = useState<any | null>(null);
	const [uniqueRegions, setUniqueRegions] = useState<string[]>([]);
	const [activeTab, setActiveTab] = useState("all");

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

	// Items per page
	const rowsPerPage = 8;

	// Extract unique regions on load
	useEffect(() => {
		if (ranks) {
			const regions = Array.from(new Set(ranks.map((rank) => rank.region).filter(Boolean) as string[]));
			setUniqueRegions(regions);
		}
	}, [ranks]);

	// Filter ranks
	useEffect(() => {
		if (!ranks) return;

		let filtered = [...ranks];

		// Apply region filter
		if (regionFilter !== "all") {
			filtered = filtered.filter((rank) => rank.region === regionFilter);
		}

		// Apply search query filter
		if (searchQuery) {
			filtered = filtered.filter(
				(rank) =>
					rank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					rank.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(rank.region || "").toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		// Apply occupancy filter - Note: This requires active data, using capacity as proxy if no real-time data yet
		if (activeTab !== "all") {
			// Placeholder logic as we don't have real-time occupancy in the basic Rank model yet
			if (activeTab === "high") {
				// filtered = filtered.filter(...)
			}
		}

		setFilteredRanks(filtered);

	}, [ranks, searchQuery, regionFilter, activeTab]);

	// Pagination calculation
	const pages = Math.ceil(filteredRanks.length / rowsPerPage);
	const paginatedRanks = filteredRanks.slice(
		(currentPage - 1) * rowsPerPage,
		currentPage * rowsPerPage,
	);

	// View rank details
	const handleViewDetails = (rank: Rank) => {
		setSelectedRank(rank);
		onOpen();
	};

	// Handle rank status update
	const handleUpdateRank = (rankId: string, action: string) => {
		addToast({
			title: "Rank Updated",
			description: `Rank ${action} successfully`,
			color: "success",
		});
		onClose();
	};

	// Calculate occupancy percentage
	const calculateOccupancy = (rank: any) => {
		const current = rank._count?.queueEntries || 0;
		const capacity = rank.capacity || 1;
		return Math.min(Math.round((current / capacity) * 100), 100);
	};

	// Get occupancy status and color
	const getOccupancyStatus = (rank: any) => {
		const percentage = calculateOccupancy(rank);
		if (percentage >= 80) return { status: "High", color: "danger" };
		if (percentage >= 40) return { status: "Medium", color: "warning" };
		return { status: "Low", color: "success" };
	};

	// Get taxis at a specific rank
	const getTaxisAtRank = (rankId: string): any[] => {
		if (!taxis) return [];
		// Filter taxis that are in the queue for this rank
		return taxis.filter((taxi: any) => taxi.queueEntry?.some((q: any) => q.rankId === rankId));
	};

	// Get routes from a specific rank
	const getRoutesFromRank = (rankId: string) => {
		if (!routes) return [];
		// Filter by sourceRankId
		return routes.filter((r: Route) => r.sourceRankId === rankId);
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Rank Management</h1>
					<Breadcrumbs>
						<BreadcrumbItem>Admin</BreadcrumbItem>
						<BreadcrumbItem>Dashboard</BreadcrumbItem>
						<BreadcrumbItem>Ranks</BreadcrumbItem>
					</Breadcrumbs>
				</div>

				<div className="flex gap-2">
					<Button
						color="primary"
						startContent={<Icon icon="lucide:map" />}
						variant="flat"
						onPress={() => window.open("/dashboard/ranks/map-view", "_blank")}>
						Map View
					</Button>

					<Button color="primary" startContent={<Icon icon="lucide:plus" />}>
						Add New Rank
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader className="flex flex-col gap-4">
					<div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
						<div className="flex gap-3 flex-col sm:flex-row">
							<Input
								classNames={{
									base: "w-full sm:w-[260px]",
									inputWrapper: "h-10",
								}}
								placeholder="Search ranks..."
								startContent={<Icon icon="lucide:search" />}
								value={searchQuery}
								onValueChange={setSearchQuery}
							/>

							<Dropdown>
								<DropdownTrigger>
									<Button
										className="w-full sm:w-auto"
										endContent={<Icon icon="lucide:chevron-down" />}
										startContent={<Icon icon="lucide:filter" />}
										variant="flat">
										{regionFilter === "all" ? "All Regions" : regionFilter}
									</Button>
								</DropdownTrigger>
								<DropdownMenu
									disallowEmptySelection
									aria-label="Region filter"
									selectedKeys={[regionFilter]}
									selectionMode="single"
									onSelectionChange={(keys) =>
										setRegionFilter(Array.from(keys)[0] as string)
									}>
									<DropdownItem key="all">All Regions</DropdownItem>
									<>
										{uniqueRegions.map((region) => (
											<DropdownItem key={region}>{region}</DropdownItem>
										))}
									</>
								</DropdownMenu>
							</Dropdown>
						</div>

						<div className="flex gap-3">
							<Dropdown>
								<DropdownTrigger>
									<Button
										startContent={<Icon icon="lucide:download" />}
										variant="flat">
										Export
									</Button>
								</DropdownTrigger>
								<DropdownMenu aria-label="Export options">
									<DropdownItem key="pdf">Export as PDF</DropdownItem>
									<DropdownItem key="excel">Export as Excel</DropdownItem>
									<DropdownItem key="csv">Export as CSV</DropdownItem>
								</DropdownMenu>
							</Dropdown>

							<Button
								color="primary"
								startContent={<Icon icon="lucide:refresh-cw" />}
								variant="flat">
								Refresh
							</Button>
						</div>
					</div>

					<Tabs
						aria-label="Rank occupancy tabs"
						color="primary"
						selectedKey={activeTab}
						onSelectionChange={(key) => {
							setActiveTab(key as string);
							setCurrentPage(1);
						}}>
						<Tab key="all" title="All Ranks" />
						<Tab key="high" title="High Occupancy" />
						<Tab key="medium" title="Medium Occupancy" />
						<Tab key="low" title="Low Occupancy" />
					</Tabs>
				</CardHeader>

				<CardBody>
					<Table
						aria-label="Rank management table"
						bottomContent={
							pages > 0 ? (
								<div className="flex justify-center">
									<Pagination
										isCompact
										showControls
										showShadow
										color="primary"
										page={currentPage}
										total={pages}
										onChange={(page) => setCurrentPage(page)}
									/>
								</div>
							) : null
						}>
						<TableHeader>
							<TableColumn>RANK NAME</TableColumn>
							<TableColumn>REGION</TableColumn>
							<TableColumn>ADDRESS</TableColumn>
							<TableColumn>OCCUPANCY</TableColumn>
							<TableColumn>TAXIS</TableColumn>
							<TableColumn>OPERATING HOURS</TableColumn>
							<TableColumn>ACTIONS</TableColumn>
						</TableHeader>

						<TableBody
							emptyContent={<div className="text-center">No ranks found</div>}
							isLoading={isLoading}
							items={paginatedRanks}
							loadingContent={<div className="text-center">Loading ranks...</div>}>
							{(rank) => {
								const occupancyInfo = getOccupancyStatus(rank);
								const occupancyPercentage = calculateOccupancy(rank);

								return (
									<TableRow key={rank.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												<Icon icon="lucide:map-pin" />
												<span className="font-medium">{rank.name}</span>
											</div>
										</TableCell>
										<TableCell>{rank.region}</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<span className="text-small">{rank.address}</span>
												<span className="text-tiny text-default-500">
													{rank.phone}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col gap-1">
												<div className="flex justify-between text-small">
													<span>
														{(rank as any)._count?.queueEntries || 0}/{rank.capacity}
													</span>
													<Chip
														color={occupancyInfo.color as any}
														size="sm"
														variant="flat">
														{occupancyInfo.status}
													</Chip>
												</div>
												<Progress
													aria-label="Occupancy"
													color={occupancyInfo.color as any}
													size="sm"
													value={occupancyPercentage}
												/>
											</div>
										</TableCell>
										<TableCell>
											{getTaxisAtRank(rank.id).length} active
										</TableCell>
										<TableCell>{rank.operatingHours}</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button
													isIconOnly
													size="sm"
													variant="light"
													onPress={() => handleViewDetails(rank)}>
													<Icon icon="lucide:eye" />
												</Button>

												<Dropdown>
													<DropdownTrigger>
														<Button
															isIconOnly
															size="sm"
															variant="light">
															<Icon icon="lucide:more-vertical" />
														</Button>
													</DropdownTrigger>
													<DropdownMenu aria-label="Rank actions">
														<DropdownItem
															key="edit"
															startContent={
																<Icon icon="lucide:edit" />
															}>
															Edit Rank
														</DropdownItem>
														<DropdownItem
															key="map"
															startContent={
																<Icon icon="lucide:map" />
															}>
															View on Map
														</DropdownItem>
														<DropdownItem
															key="report"
															startContent={
																<Icon icon="lucide:file-text" />
															}>
															Generate Report
														</DropdownItem>
														<DropdownItem
															key="notify"
															startContent={
																<Icon icon="lucide:bell" />
															}>
															Send Notification
														</DropdownItem>
													</DropdownMenu>
												</Dropdown>
											</div>
										</TableCell>
									</TableRow>
								);
							}}
						</TableBody>
					</Table>
				</CardBody>
			</Card>

			{/* Rank Details Modal */}
			{selectedRank && (
				<Modal isOpen={isOpen} size="full" onOpenChange={onOpenChange}>
					<ModalContent>
						{() => (
							<>
								<ModalHeader className="flex flex-col gap-1">
									{selectedRank.name}
									<p className="text-small text-default-500">
										{selectedRank.region}
									</p>
								</ModalHeader>

								<ModalBody>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-6">
											<Card>
												<CardHeader className="pb-0">
													<h3 className="text-lg font-medium">
														Rank Information
													</h3>
												</CardHeader>
												<CardBody>
													<div className="space-y-4">
														<div>
															<p className="text-small text-default-500">
																Address
															</p>
															<p className="font-medium">
																{selectedRank.address}
															</p>
														</div>

														<div className="grid grid-cols-2 gap-4">
															<div>
																<p className="text-small text-default-500">
																	Phone
																</p>
																<p className="font-medium">
																	{selectedRank.phone}
																</p>
															</div>
															<div>
																<p className="text-small text-default-500">
																	Operating Hours
																</p>
																<p className="font-medium">
																	{selectedRank.operatingHours}
																</p>
															</div>
														</div>

														<div className="grid grid-cols-2 gap-4">
															<div>
																<p className="text-small text-default-500">
																	Capacity
																</p>
																<p className="font-medium">
																	{selectedRank.capacity} taxis
																</p>
															</div>
															<div>
																<p className="text-small text-default-500">
																	Current Occupancy
																</p>
																<p className="font-medium">
																	N/A
																</p>
															</div>
														</div>

														<div>
															<p className="text-small text-default-500">
																Facilities
															</p>
															<div className="flex flex-wrap gap-1 mt-1">
																<Chip size="sm">N/A</Chip>
															</div>
														</div>

														<div>
															<p className="text-small text-default-500">
																Last Inspection
															</p>
															<p className="font-medium">
																N/A
															</p>
														</div>

														<div>
															<p className="text-small text-default-500">
																Managers
															</p>
															<p className="font-medium">
																N/A
															</p>
														</div>
													</div>
												</CardBody>
											</Card>

											<Card>
												<CardHeader className="pb-0">
													<h3 className="text-lg font-medium">
														Available Routes
													</h3>
												</CardHeader>
												<CardBody>
													{getRoutesFromRank(selectedRank.id).length >
														0 ? (
														<Table
															aria-label="Routes from this rank"
															className="text-sm">
															<TableHeader>
																<TableColumn>ROUTE</TableColumn>
																<TableColumn>FARE</TableColumn>
																<TableColumn>STATUS</TableColumn>
															</TableHeader>
															<TableBody
																items={getRoutesFromRank(
																	selectedRank.id,
																)}>
																{(route) => (
																	<TableRow key={route.id}>
																		<TableCell>
																			{route.name}
																		</TableCell>
																		<TableCell>
																			{typeof route.baseFare === 'object' ? (route.baseFare as any).toString() : route.baseFare}
																		</TableCell>
																		<TableCell>
																			<Chip
																				color={
																					route.status ===
																						"ACTIVE"
																						? "success"
																						: route.status ===
																							"BUSY"
																							? "warning"
																							: "danger"
																				}
																				size="sm">
																				{route.status}
																			</Chip>
																		</TableCell>
																	</TableRow>
																)}
															</TableBody>
														</Table>
													) : (
														<div className="flex flex-col items-center justify-center py-6">
															<Icon
																className="text-3xl text-default-400 mb-2"
																icon="lucide:route-off"
															/>
															<p className="text-default-500">
																No routes available
															</p>
														</div>
													)}
												</CardBody>
											</Card>
										</div>

										<div className="space-y-6">
											<Card>
												<CardHeader className="pb-0">
													<h3 className="text-lg font-medium">
														Location
													</h3>
												</CardHeader>
												<CardBody>
													<div className="h-[200px] bg-default-100 rounded-lg flex items-center justify-center">
														<div className="text-center">
															<p className="text-default-500 mb-2">
																Map view would appear here
															</p>
															<p className="text-xs">
																Coordinates:{" "}
																{selectedRank.lat},{" "}
																{selectedRank.lng}
															</p>
														</div>
													</div>

													<Button
														fullWidth
														className="mt-4"
														color="primary"
														startContent={
															<Icon icon="lucide:navigation" />
														}
														variant="flat">
														Get Directions
													</Button>
												</CardBody>
											</Card>

											<Card>
												<CardHeader className="pb-0">
													<h3 className="text-lg font-medium">
														Current Taxis
													</h3>
												</CardHeader>
												<CardBody>
													{getTaxisAtRank(selectedRank.id).length > 0 ? (
														<Table
															aria-label="Taxis at this rank"
															className="text-sm">
															<TableHeader>
																<TableColumn>TAXI</TableColumn>
																<TableColumn>DRIVER</TableColumn>
																<TableColumn>STATUS</TableColumn>
															</TableHeader>
															<TableBody
																items={getTaxisAtRank(
																	selectedRank.id,
																).slice(0, 5)}>
																{(taxi) => (
																	<TableRow key={taxi.id}>
																		<TableCell>
																			<div className="flex flex-col">
																				<span>
																					{taxi.model}
																				</span>
																				<span className="text-tiny text-default-500">
																					{
																						taxi.licensePlate
																					}
																				</span>
																			</div>
																		</TableCell>
																		<TableCell>
																			{taxi.driver?.fullName || taxi.driver?.firstName || "Unknown"}
																		</TableCell>
																		<TableCell>
																			<Chip
																				color={
																					taxi.status ===
																						"AVAILABLE"
																						? "success"
																						: "warning"
																				}
																				size="sm">
																				{taxi.status}
																			</Chip>
																		</TableCell>
																	</TableRow>
																)}
															</TableBody>
														</Table>
													) : (
														<div className="flex flex-col items-center justify-center py-6">
															<Icon
																className="text-3xl text-default-400 mb-2"
																icon="lucide:car-off"
															/>
															<p className="text-default-500">
																No active taxis at this rank
															</p>
														</div>
													)}

													{getTaxisAtRank(selectedRank.id).length > 5 && (
														<Button
															fullWidth
															className="mt-4"
															size="sm"
															variant="flat">
															View all{" "}
															{getTaxisAtRank(selectedRank.id).length}{" "}
															taxis
														</Button>
													)}
												</CardBody>
											</Card>

											<Card>
												<CardHeader className="pb-0">
													<h3 className="text-lg font-medium">
														Occupancy Trend
													</h3>
												</CardHeader>
												<CardBody>
													<div className="h-[200px]">
														<ResponsiveContainer
															height="100%"
															width="100%">
															<LineChart
																data={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({
																	day,
																	occupancy: Math.round(
																		(selectedRank._count?.queueEntries || 0) *
																		[0.9, 1.1, 0.85, 1.2, 1.4, 0.8, 0.6][i],
																	),
																}))}
																margin={{
																	top: 5,
																	right: 20,
																	left: 0,
																	bottom: 5,
																}}>
																<CartesianGrid
																	opacity={0.1}
																	strokeDasharray="3 3"
																/>
																<XAxis dataKey="day" />
																<YAxis
																	domain={[
																		0,
																		selectedRank.capacity || 50,
																	]}
																/>
																<Tooltip
																	contentStyle={{
																		backgroundColor:
																			"var(--background)",
																		borderColor:
																			"var(--divider)",
																	}}
																/>
																<Line
																	activeDot={{ r: 8 }}
																	dataKey="occupancy"
																	name="Taxis"
																	stroke="#0070F3"
																	strokeWidth={2}
																	type="monotone"
																/>
																{/* Add a reference line for capacity */}
																<ReferenceLine
																	label={{
																		value: "Capacity",
																		position: "insideTopRight",
																		fill: "rgba(249, 115, 22, 0.8)",
																		fontSize: 12,
																	}}
																	stroke="rgba(249, 115, 22, 0.5)"
																	strokeDasharray="3 3"
																	y={selectedRank.capacity || 0}
																/>
															</LineChart>
														</ResponsiveContainer>
													</div>
												</CardBody>
											</Card>
										</div>
									</div>
								</ModalBody>

								<ModalFooter>
									<Button
										color="danger"
										startContent={<Icon icon="lucide:alert-triangle" />}
										variant="flat"
										onPress={() => handleUpdateRank(selectedRank.id, "closed")}>
										Report Issue
									</Button>
									<Button
										color="primary"
										onPress={() =>
											handleUpdateRank(selectedRank.id, "updated")
										}>
										Update Status
									</Button>
									<Button color="default" onPress={onClose}>
										Close
									</Button>
								</ModalFooter>
							</>
						)}
					</ModalContent>
				</Modal>
			)}

			{/* Rank Statistics Section */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
				<Card className="shadow-sm">
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-default-500">Total Ranks</p>
								<p className="text-2xl font-bold mt-1">{ranks?.length || 0}</p>
							</div>
							<div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
								<Icon className="text-primary text-2xl" icon="lucide:map-pin" />
							</div>
						</div>
					</CardBody>
				</Card>

				<Card className="shadow-sm">
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-default-500">Active Routes</p>
								<p className="text-2xl font-bold mt-1">
									{routes.filter((r) => r.status === "ACTIVE").length}
								</p>
							</div>
							<div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
								<Icon className="text-success text-2xl" icon="lucide:route" />
							</div>
						</div>
					</CardBody>
				</Card>

				<Card className="shadow-sm">
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-default-500">Active Taxis</p>
								<p className="text-2xl font-bold mt-1">
									{taxis.filter((t) => t.status !== "OFFLINE").length}
								</p>
							</div>
							<div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
								<Icon className="text-warning text-2xl" icon="lucide:car" />
							</div>
						</div>
					</CardBody>
				</Card>

				<Card className="shadow-sm">
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-default-500">Avg. Occupancy</p>
								<p className="text-2xl font-bold mt-1">
									{Math.round(
										(ranks || []).reduce((acc: number, rank: any) => {
											return (
												acc + ((rank._count?.queueEntries || 0) / (rank.capacity || 1)) * 100
											);
										}, 0) / ((ranks?.length || 1)),
									)}
									%
								</p>
							</div>
							<div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center">
								<Icon className="text-danger text-2xl" icon="lucide:bar-chart-2" />
							</div>
						</div>
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
