"use client";
import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Breadcrumbs, BreadcrumbItem, Button, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input, Pagination, Select, SelectItem, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Icon } from "@iconify/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { TripReceipt } from "@/components/dashboard/TripReceipt";
import { ResponsiveContainer, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { iTrip } from "@/types";
import { useTrips } from "@/hooks/useTrips";
import { useDrivers } from "@/hooks/useDrivers";
import { useRouter } from "next/navigation";

export default function TripsPage() {
	const router = useRouter();
	const { trips: realTrips, isLoading: isTripsLoading } = useTrips();
	const { drivers } = useDrivers();
	type TripReceiptData = React.ComponentProps<typeof TripReceipt>["trip"];
	const [isLoading, setIsLoading] = useState(true);
	const [filteredTrips, setFilteredTrips] = useState<iTrip[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedTrip, setSelectedTrip] = useState<iTrip | null>(null);
	const [dateRange, setDateRange] = useState("all");
	const [printingTrip, setPrintingTrip] = useState<TripReceiptData | null>(null);
	const [isPrinting, setIsPrinting] = useState(false);

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

	// Items per page
	const rowsPerPage = 10;

	// Handle Download Receipt
	const handleDownloadReceipt = async (tripId: string) => {
		const trip = realTrips?.find((t) => t.id === tripId);
		if (!trip) return;

		// Map to the format needed by TripReceipt
		const tripDataForReceipt = {
			id: trip.id,
			requestTime: new Date(trip.createdAt).toISOString(),
			pickupAddress: trip.pickupAddress || "Unknown Pickup",
			dropoffAddress: trip.dropoffAddress || "Unknown Destination",
			fare: Number(trip.fare) || 0,
			platformFee: null,
			paymentMethod: trip.paymentMethod || "CASH",
			paymentStatus: trip.paymentStatus || "COMPLETED",
			route: {
				name: trip.route?.name || "Standard Route",
			},
			vehicleTrip: trip.vehicleTrip
				? {
						driver: {
							fullName: trip.vehicleTrip.driver.fullName || `${trip.vehicleTrip.driver.firstName} ${trip.vehicleTrip.driver.lastName}`,
							firstName: trip.vehicleTrip.driver.firstName,
							lastName: trip.vehicleTrip.driver.lastName,
						},
						taxi: {
							model: `${trip.vehicleTrip.taxi.make} ${trip.vehicleTrip.taxi.model}`,
							licensePlate: trip.vehicleTrip.taxi.licensePlate,
						},
					}
				: null,
		};

		setPrintingTrip(tripDataForReceipt);
		setIsPrinting(true);

		// Small delay to ensure the receipt component is rendered
		setTimeout(async () => {
			const input = document.getElementById("trip-receipt-printable");
			if (input) {
				try {
					const canvas = await html2canvas(input, {
						scale: 2,
						useCORS: true,
						logging: false,
					});
					const imgData = canvas.toDataURL("image/png");
					const pdf = new jsPDF("p", "mm", "a4");
					const pdfWidth = pdf.internal.pageSize.getWidth();
					const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

					pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
					pdf.save(`receipt-${trip.id.substring(0, 8)}.pdf`);
				} catch (error) {
					console.error("Error generating PDF:", error);
				} finally {
					setIsPrinting(false);
					setPrintingTrip(null);
				}
			}
		}, 600);
	};

	// Filter trips
	useEffect(() => {
		if (isTripsLoading) {
			setIsLoading(true);
			return;
		}

		const sourceData = realTrips && realTrips.length > 0 ? realTrips : null;
		let mappedData: iTrip[] = [];

		if (sourceData) {
			mappedData = sourceData.map((t: any) => ({
				id: t.id,
				route: t.vehicleTrip?.route?.name || "Unknown Route",
				date: t.requestTime ? new Date(t.requestTime).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
				time: t.requestTime ? new Date(t.requestTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
				pickup: t.pickupAddress || "N/A",
				dropoff: t.dropoffAddress || "N/A",
				driver: t.vehicleTrip?.driver?.fullName || (t.vehicleTrip?.driver ? `${t.vehicleTrip.driver.firstName} ${t.vehicleTrip.driver.lastName}` : "Unassigned"),
				vehicle: t.vehicleTrip?.taxi?.model || "Unknown",
				licensePlate: t.vehicleTrip?.taxi?.licensePlate || "Unknown",
				fare: t.fare ? `R${Number(t.fare).toFixed(2)}` : "R0.00",
				status: (t.status?.toLowerCase() === "arrived_at_pickup" ? "in-progress" : t.status?.toLowerCase() === "requested" ? "in-progress" : t.status?.toLowerCase() === "accepted" ? "in-progress" : t.status?.toLowerCase()) as any,
				paymentMethod: t.paymentMethod ? t.paymentMethod.replace("_", " ") : "CASH",
				rating: undefined,
			}));
		}
		let filtered = mappedData;

		// Apply status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter((trip) => trip.status === statusFilter);
		}

		// Apply date range filter
		if (dateRange !== "all") {
			const today = new Date();
			const filterDate = new Date();

			switch (dateRange) {
				case "today":
					filtered = filtered.filter((trip) => {
						const tripDate = new Date(trip.date);

						return tripDate.toDateString() === today.toDateString();
					});
					break;
				case "week":
					filterDate.setDate(today.getDate() - 7);
					filtered = filtered.filter((trip) => {
						const tripDate = new Date(trip.date);

						return tripDate >= filterDate;
					});
					break;
				case "month":
					filterDate.setMonth(today.getMonth() - 1);
					filtered = filtered.filter((trip) => {
						const tripDate = new Date(trip.date);

						return tripDate >= filterDate;
					});
					break;
			}
		}

		// Apply search query filter
		if (searchQuery) {
			filtered = filtered.filter((trip) => trip.route.toLowerCase().includes(searchQuery.toLowerCase()) || trip.driver.toLowerCase().includes(searchQuery.toLowerCase()) || trip.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()));
		}

		setFilteredTrips(filtered);
		setIsLoading(false);
	}, [searchQuery, statusFilter, dateRange, realTrips, isTripsLoading]);

	// Pagination calculation
	const pages = Math.ceil(filteredTrips.length / rowsPerPage);
	const paginatedTrips = filteredTrips.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

	// View trip details
	const handleViewDetails = (trip: iTrip) => {
		setSelectedTrip(trip);
		onOpen();
	};

	// Get driver info
	const getDriverInfo = (driverName: string) => {
		return drivers?.find((driver) => driver.fullName === driverName);
	};

	// Status chip renderer
	const renderStatusChip = (status: string) => {
		let color: "success" | "warning" | "danger" | "default" | "primary" | "secondary" | undefined;

		switch (status) {
			case "completed":
				color = "success";
				break;
			case "in-progress":
				color = "warning";
				break;
			case "cancelled":
				color = "danger";
				break;
			default:
				color = "default";
		}

		return (
			<Chip color={color} size='sm'>
				{status}
			</Chip>
		);
	};

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-2xl font-bold'>Trip Management</h1>
					<Breadcrumbs>
						<BreadcrumbItem>Admin</BreadcrumbItem>
						<BreadcrumbItem>Dashboard</BreadcrumbItem>
						<BreadcrumbItem>Trips</BreadcrumbItem>
					</Breadcrumbs>
				</div>

				<div className='flex gap-2'>
					<Button color='primary' startContent={<Icon icon='lucide:map' />} variant='flat' onPress={() => router.push("/dashboard/trips/live-tracking")}>
						Live Tracking
					</Button>

					<Button color='primary' startContent={<Icon icon='lucide:plus' />}>
						Create Manual Trip
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader className='flex flex-col gap-4'>
					<div className='flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center'>
						<div className='flex gap-3 flex-col sm:flex-row'>
							<Input
								classNames={{
									base: "w-full sm:w-[260px]",
									inputWrapper: "h-10",
								}}
								placeholder='Search trips...'
								startContent={<Icon icon='lucide:search' />}
								value={searchQuery}
								onValueChange={setSearchQuery}
							/>

							<Select className='w-full sm:w-[180px]' placeholder='Filter by status' selectedKeys={[statusFilter]} onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}>
								<SelectItem key='all'>All Statuses</SelectItem>
								<SelectItem key='completed'>Completed</SelectItem>
								<SelectItem key='in-progress'>In Progress</SelectItem>
								<SelectItem key='cancelled'>Cancelled</SelectItem>
							</Select>

							<Select className='w-full sm:w-[180px]' placeholder='Date range' selectedKeys={[dateRange]} onSelectionChange={(keys) => setDateRange(Array.from(keys)[0] as string)}>
								<SelectItem key='all'>All Time</SelectItem>
								<SelectItem key='today'>Today</SelectItem>
								<SelectItem key='week'>This Week</SelectItem>
								<SelectItem key='month'>This Month</SelectItem>
							</Select>
						</div>

						<div className='flex gap-3'>
							<Dropdown>
								<DropdownTrigger>
									<Button startContent={<Icon icon='lucide:download' />} variant='flat'>
										Export
									</Button>
								</DropdownTrigger>
								<DropdownMenu aria-label='Export options'>
									<DropdownItem key='pdf'>Export as PDF</DropdownItem>
									<DropdownItem key='excel'>Export as Excel</DropdownItem>
									<DropdownItem key='csv'>Export as CSV</DropdownItem>
								</DropdownMenu>
							</Dropdown>

							<Button color='primary' startContent={<Icon icon='lucide:refresh-cw' />} variant='flat'>
								Refresh
							</Button>
						</div>
					</div>
				</CardHeader>

				<CardBody>
					<Table
						aria-label='Trip management table'
						bottomContent={
							pages > 0 ? (
								<div className='flex justify-center'>
									<Pagination isCompact showControls showShadow color='primary' page={currentPage} total={pages} onChange={(page) => setCurrentPage(page)} />
								</div>
							) : null
						}>
						<TableHeader>
							<TableColumn>DATE/TIME</TableColumn>
							<TableColumn>ROUTE</TableColumn>
							<TableColumn>DRIVER</TableColumn>
							<TableColumn>FARE</TableColumn>
							<TableColumn>PAYMENT</TableColumn>
							<TableColumn>STATUS</TableColumn>
							<TableColumn>ACTIONS</TableColumn>
						</TableHeader>

						<TableBody emptyContent={<div className='text-center'>No trips found</div>} isLoading={isLoading} items={paginatedTrips} loadingContent={<div className='text-center'>Loading trips...</div>}>
							{(trip) => (
								<TableRow key={trip.id}>
									<TableCell>
										<div className='flex flex-col'>
											<span className='text-small'>{trip.date}</span>
											<span className='text-tiny text-default-500'>{trip.time}</span>
										</div>
									</TableCell>
									<TableCell>
										<div className='flex flex-col'>
											<span className='text-small font-medium'>{trip.route}</span>
											<span className='text-tiny text-default-500'>From: {trip.pickup}</span>
										</div>
									</TableCell>
									<TableCell>{trip.driver}</TableCell>
									<TableCell>{trip.fare}</TableCell>
									<TableCell>
										<Chip color={trip.paymentMethod === "Cash" ? "warning" : "primary"} size='sm' variant='flat'>
											{trip.paymentMethod}
										</Chip>
									</TableCell>
									<TableCell>{renderStatusChip(trip.status)}</TableCell>
									<TableCell>
										<div className='flex gap-2'>
											<Button isIconOnly size='sm' variant='light' onPress={() => handleViewDetails(trip)}>
												<Icon icon='lucide:eye' />
											</Button>

											<Dropdown>
												<DropdownTrigger>
													<Button isIconOnly size='sm' variant='light'>
														<Icon icon='lucide:more-vertical' />
													</Button>
												</DropdownTrigger>
												<DropdownMenu
													aria-label='Trip actions'
													onAction={(key) => {
														console.log("Action key:", key);
														if (key === "track") {
															router.push(`/dashboard/trips/live-tracking?tripId=${trip.id}`);
														} else if (key === "print") {
															handleDownloadReceipt(trip.id);
														}
													}}>
													<DropdownItem key='print' startContent={<Icon icon='lucide:printer' />}>
														Print Receipt
													</DropdownItem>
													<DropdownItem key='notify' startContent={<Icon icon='lucide:message-square' />}>
														Message Driver
													</DropdownItem>
													<>
														{trip.status === "in-progress" && (
															<DropdownItem key='track' startContent={<Icon icon='lucide:map-pin' />}>
																Track Trip
															</DropdownItem>
														)}
														{trip.status === "in-progress" && (
															<DropdownItem key='cancel' color='danger' startContent={<Icon icon='lucide:x' />}>
																Cancel Trip
															</DropdownItem>
														)}
													</>
												</DropdownMenu>
											</Dropdown>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardBody>
			</Card>

			{/* Trip Details Modal */}
			{selectedTrip && (
				<Modal isOpen={isOpen} size='3xl' onOpenChange={onOpenChange}>
					<ModalContent>
						{() => (
							<>
								<ModalHeader className='flex flex-col gap-1'>
									Trip Details
									<p className='text-small text-default-500'>ID: {selectedTrip.id}</p>
								</ModalHeader>

								<ModalBody>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										<div>
											<Card>
												<CardHeader className='pb-0'>
													<h3 className='text-lg font-medium'>Route Information</h3>
												</CardHeader>
												<CardBody className='py-3'>
													<div className='space-y-4'>
														<div>
															<p className='text-small text-default-500'>Route</p>
															<p className='font-medium'>{selectedTrip.route}</p>
														</div>

														<div className='grid grid-cols-2 gap-4'>
															<div>
																<p className='text-small text-default-500'>Pickup</p>
																<p className='font-medium'>{selectedTrip.pickup}</p>
															</div>
															<div>
																<p className='text-small text-default-500'>Dropoff</p>
																<p className='font-medium'>{selectedTrip.dropoff}</p>
															</div>
														</div>

														<div className='grid grid-cols-2 gap-4'>
															<div>
																<p className='text-small text-default-500'>Date</p>
																<p className='font-medium'>{selectedTrip.date}</p>
															</div>
															<div>
																<p className='text-small text-default-500'>Time</p>
																<p className='font-medium'>{selectedTrip.time}</p>
															</div>
														</div>

														<div className='grid grid-cols-2 gap-4'>
															<div>
																<p className='text-small text-default-500'>Status</p>
																<div>{renderStatusChip(selectedTrip.status)}</div>
															</div>
															<div>
																<p className='text-small text-default-500'>Fare</p>
																<p className='font-medium'>{selectedTrip.fare}</p>
															</div>
														</div>

														<div>
															<p className='text-small text-default-500'>Payment Method</p>
															<p className='font-medium'>{selectedTrip.paymentMethod}</p>
														</div>

														<div>
															<p className='text-small text-default-500'>Rating</p>
															<div className='flex items-center gap-1'>
																{[...Array(5)].map((_, i) => (
																	<Icon key={i} className={i < (selectedTrip.rating || 0) ? "text-primary-500" : "text-default-300"} icon='lucide:star' />
																))}
																<span className='ml-1'>{selectedTrip.rating ? `${selectedTrip.rating}/5` : "Not rated"}</span>
															</div>
														</div>
													</div>
												</CardBody>
											</Card>
										</div>

										<div className='space-y-6'>
											<Card>
												<CardHeader className='pb-0'>
													<h3 className='text-lg font-medium'>Driver & Vehicle</h3>
												</CardHeader>
												<CardBody className='py-3'>
													<div className='space-y-4'>
														<div className='flex items-center gap-3'>
															<div className='w-12 h-12 rounded-full bg-default-100 flex items-center justify-center overflow-hidden'>
																{getDriverInfo(selectedTrip.driver) ? <img alt={selectedTrip.driver} className='w-full h-full object-cover' src={getDriverInfo(selectedTrip.driver)?.profileImage || undefined} /> : <Icon className='text-2xl text-default-400' icon='lucide:user' />}
															</div>
															<div>
																<p className='font-medium'>{selectedTrip.driver}</p>
																<div className='flex items-center text-sm text-default-500 gap-1'>
																	<Icon className='text-primary-500' icon='lucide:star' />
																	<span>{(getDriverInfo(selectedTrip.driver) as any)?.rating || "N/A"}</span>
																</div>
															</div>
														</div>

														<div className='grid grid-cols-2 gap-4'>
															<div>
																<p className='text-small text-default-500'>Vehicle</p>
																<p className='font-medium'>{selectedTrip.vehicle}</p>
															</div>
															<div>
																<p className='text-small text-default-500'>License Plate</p>
																<p className='font-medium'>{selectedTrip.licensePlate}</p>
															</div>
														</div>

														<Button fullWidth color='primary' startContent={<Icon icon='lucide:phone' />} variant='flat'>
															Contact Driver
														</Button>
													</div>
												</CardBody>
											</Card>

											<Card>
												<CardHeader className='pb-0'>
													<h3 className='text-lg font-medium'>Trip Details</h3>
												</CardHeader>
												<CardBody>
													<div className='h-[200px]'>
														<ResponsiveContainer height='100%' width='100%'>
															<AreaChart
																data={[
																	{
																		time: "0%",
																		elevation: 10,
																		speed: 0,
																	},
																	{
																		time: "10%",
																		elevation: 15,
																		speed: 45,
																	},
																	{
																		time: "20%",
																		elevation: 25,
																		speed: 60,
																	},
																	{
																		time: "30%",
																		elevation: 30,
																		speed: 55,
																	},
																	{
																		time: "40%",
																		elevation: 20,
																		speed: 65,
																	},
																	{
																		time: "50%",
																		elevation: 25,
																		speed: 50,
																	},
																	{
																		time: "60%",
																		elevation: 35,
																		speed: 45,
																	},
																	{
																		time: "70%",
																		elevation: 40,
																		speed: 30,
																	},
																	{
																		time: "80%",
																		elevation: 35,
																		speed: 40,
																	},
																	{
																		time: "90%",
																		elevation: 25,
																		speed: 50,
																	},
																	{
																		time: "100%",
																		elevation: 10,
																		speed: 20,
																	},
																]}
																margin={{
																	top: 10,
																	right: 30,
																	left: 0,
																	bottom: 0,
																}}>
																<defs>
																	<linearGradient id='colorElevation' x1='0' x2='0' y1='0' y2='1'>
																		<stop offset='5%' stopColor='#0070F3' stopOpacity={0.8} />
																		<stop offset='95%' stopColor='#0070F3' stopOpacity={0.1} />
																	</linearGradient>
																</defs>
																<CartesianGrid opacity={0.1} strokeDasharray='3 3' vertical={false} />
																<XAxis dataKey='time' />
																<YAxis />
																<Tooltip
																	contentStyle={{
																		backgroundColor: "var(--background)",
																		borderColor: "var(--divider)",
																	}}
																/>
																<Area dataKey='elevation' fill='url(#colorElevation)' fillOpacity={1} name='Route Elevation' stroke='#0070F3' type='monotone' />
																<Line dataKey='speed' dot={false} name='Speed (km/h)' stroke='#F59E0B' strokeWidth={2} type='monotone' />
															</AreaChart>
														</ResponsiveContainer>
													</div>
												</CardBody>
											</Card>
										</div>
									</div>

									{selectedTrip.status === "in-progress" && (
										<Card className='mt-4 border border-warning'>
											<CardBody className='p-3 flex items-center justify-between'>
												<div className='flex items-center gap-2'>
													<Icon className='text-warning' icon='lucide:alert-triangle' />
													<p>This trip is currently in progress.</p>
												</div>
												<Button color='warning' size='sm' startContent={<Icon icon='lucide:map-pin' />}>
													Track Live Location
												</Button>
											</CardBody>
										</Card>
									)}
								</ModalBody>

								<ModalFooter>
									{selectedTrip.status === "in-progress" && (
										<Button
											color='primary'
											startContent={<Icon icon='lucide:map-pin' />}
											onPress={() => {
												router.push(`/dashboard/trips/live-tracking?tripId=${selectedTrip.id}`);
												onClose();
											}}>
											Track Trip
										</Button>
									)}
									<Button color='danger' startContent={<Icon icon='lucide:flag' />} variant='flat'>
										Report Issue
									</Button>
									<Button color='primary' onPress={onClose}>
										Close
									</Button>
								</ModalFooter>
							</>
						)}
					</ModalContent>
				</Modal>
			)}

			{/* Trip Stats Cards (optional) */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6'>
				<Card className='shadow-sm'>
					<CardBody className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-default-500'>Total Trips</p>
								<p className='text-2xl font-bold mt-1'>{filteredTrips.length}</p>
							</div>
							<div className='w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center'>
								<Icon className='text-primary text-2xl' icon='lucide:map' />
							</div>
						</div>
					</CardBody>
				</Card>

				<Card className='shadow-sm'>
					<CardBody className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-default-500'>Completed Trips</p>
								<p className='text-2xl font-bold mt-1'>{filteredTrips.filter((t) => t.status === "completed").length}</p>
							</div>
							<div className='w-12 h-12 rounded-full bg-success/20 flex items-center justify-center'>
								<Icon className='text-success text-2xl' icon='lucide:check-circle' />
							</div>
						</div>
					</CardBody>
				</Card>

				<Card className='shadow-sm'>
					<CardBody className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-default-500'>Cancelled Trips</p>
								<p className='text-2xl font-bold mt-1'>{filteredTrips.filter((t) => t.status === "cancelled").length}</p>
							</div>
							<div className='w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center'>
								<Icon className='text-danger text-2xl' icon='lucide:x-circle' />
							</div>
						</div>
					</CardBody>
				</Card>

				<Card className='shadow-sm'>
					<CardBody className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-default-500'>Active Trips</p>
								<p className='text-2xl font-bold mt-1'>{filteredTrips.filter((t) => t.status === "in-progress").length}</p>
							</div>
							<div className='w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center'>
								<Icon className='text-warning text-2xl' icon='lucide:loader' />
							</div>
						</div>
					</CardBody>
				</Card>
			</div>

			{/* Hidden Receipt Component for PDF generation */}
			{isPrinting && printingTrip && (
				<div
					style={{
						position: "fixed",
						left: "-9999px",
						top: "100px",
						zIndex: -1,
						background: "white",
						color: "black",
					}}>
					<div id='trip-receipt-printable' style={{ background: "white" }}>
						<TripReceipt trip={printingTrip} />
					</div>
				</div>
			)}
		</div>
	);
}
