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
	Tabs,
	Tab,
	useDisclosure,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@heroui/react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/toast";

// Import taxis from data
import { taxis, taxiDocuments, drivers } from "@/lib/data";
import { iTaxi } from "@/types";

export default function TaxisPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [filteredTaxis, setFilteredTaxis] = useState<iTaxi[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedTaxi, setSelectedTaxi] = useState<iTaxi | null>(null);
	const [activeTab, setActiveTab] = useState("all");

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

	// Items per page
	const rowsPerPage = 8;

	// Filter and sort taxis
	useEffect(() => {
		setIsLoading(true);

		// Simulate API call delay
		setTimeout(() => {
			let filtered = [...taxis];

			// Apply tab filter
			if (activeTab !== "all") {
				filtered = filtered.filter((taxi) => taxi.status === activeTab);
			}

			// Apply search query filter
			if (searchQuery) {
				filtered = filtered.filter(
					(taxi) =>
						taxi.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
						taxi.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
						taxi.model.toLowerCase().includes(searchQuery.toLowerCase()),
				);
			}

			setFilteredTaxis(filtered);
			setIsLoading(false);
		}, 500);
	}, [searchQuery, statusFilter, activeTab]);

	// Pagination calculation
	const pages = Math.ceil(filteredTaxis.length / rowsPerPage);
	const paginatedTaxis = filteredTaxis.slice(
		(currentPage - 1) * rowsPerPage,
		currentPage * rowsPerPage,
	);

	// Handle taxi status change
	const handleStatusChange = (taxiId: string, newStatus: string) => {
		addToast({
			title: "Taxi Status Updated",
			description: `Taxi status changed to ${newStatus}`,
			color: "success",
		});
	};

	// Handle view taxi details
	const handleViewDetails = (taxi: iTaxi) => {
		setSelectedTaxi(taxi);
		onOpen();
	};

	// Status chip renderer
	const renderStatusChip = (status: string) => {
		let color;

		switch (status) {
			case "available":
				color = "success";
				break;
			case "busy":
				color = "warning";
				break;
			case "offline":
				color = "danger";
				break;
			default:
				color = "default";
		}

		return (
			<Chip color={color as any} size="sm">
				{status}
			</Chip>
		);
	};

	// Get related documents for a taxi
	const getTaxiDocuments = (taxiId: string) => {
		return taxiDocuments.filter((doc) => doc.taxiId === taxiId);
	};

	// Get driver info for a taxi
	const getDriverInfo = (driverName: string) => {
		return drivers.find((driver) => driver.name === driverName);
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Taxi Management</h1>
					<Breadcrumbs>
						<BreadcrumbItem>Admin</BreadcrumbItem>
						<BreadcrumbItem>Dashboard</BreadcrumbItem>
						<BreadcrumbItem>Taxis</BreadcrumbItem>
					</Breadcrumbs>
				</div>

				<Button color="primary" startContent={<Icon icon="lucide:plus" />}>
					Register New Taxi
				</Button>
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
								placeholder="Search taxis..."
								startContent={<Icon icon="lucide:search" />}
								value={searchQuery}
								onValueChange={setSearchQuery}
							/>
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
						aria-label="Taxi status tabs"
						color="primary"
						selectedKey={activeTab}
						onSelectionChange={(key) => {
							setActiveTab(key as string);
							setCurrentPage(1);
						}}>
						<Tab key="all" title="All Taxis" />
						<Tab key="available" title="Available" />
						<Tab key="busy" title="Busy" />
						<Tab key="offline" title="Offline" />
					</Tabs>
				</CardHeader>

				<CardBody>
					<Table
						aria-label="Taxi management table"
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
							<TableColumn>LICENSE PLATE</TableColumn>
							<TableColumn>MODEL</TableColumn>
							<TableColumn>DRIVER</TableColumn>
							<TableColumn>CAPACITY</TableColumn>
							<TableColumn>ROUTE</TableColumn>
							<TableColumn>STATUS</TableColumn>
							<TableColumn>ACTIONS</TableColumn>
						</TableHeader>

						<TableBody
							emptyContent={<div className="text-center">No taxis found</div>}
							isLoading={isLoading}
							items={paginatedTaxis}
							loadingContent={<div className="text-center">Loading taxis...</div>}>
							{(taxi) => (
								<TableRow key={taxi.id}>
									<TableCell>
										<div className="flex items-center gap-2">
											<Icon icon="lucide:car" />
											<span className="font-medium">{taxi.licensePlate}</span>
										</div>
									</TableCell>
									<TableCell>{taxi.model}</TableCell>
									<TableCell>{taxi.driver}</TableCell>
									<TableCell>{taxi.capacity} seats</TableCell>
									<TableCell>{taxi.routeId || "Not assigned"}</TableCell>
									<TableCell>{renderStatusChip(taxi.status)}</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button
												isIconOnly
												size="sm"
												variant="light"
												onPress={() => handleViewDetails(taxi)}>
												<Icon icon="lucide:eye" />
											</Button>

											<Dropdown>
												<DropdownTrigger>
													<Button isIconOnly size="sm" variant="light">
														<Icon icon="lucide:more-vertical" />
													</Button>
												</DropdownTrigger>
												<DropdownMenu aria-label="Taxi actions">
													<DropdownItem key="edit">
														Edit Details
													</DropdownItem>
													<DropdownItem key="assign">
														Assign Route
													</DropdownItem>
													<DropdownItem key="maintenance" color="warning">
														Schedule Maintenance
													</DropdownItem>
													{taxi.status !== "offline" ? (
														<DropdownItem
															key="offline"
															color="danger"
															onPress={() =>
																handleStatusChange(
																	taxi.id,
																	"offline",
																)
															}>
															Set Offline
														</DropdownItem>
													) : (
														<DropdownItem
															key="available"
															color="success"
															onPress={() =>
																handleStatusChange(
																	taxi.id,
																	"available",
																)
															}>
															Set Available
														</DropdownItem>
													)}
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

			{/* Taxi Details Modal */}
			{selectedTaxi && (
				<Modal isOpen={isOpen} size="3xl" onOpenChange={onOpenChange}>
					<ModalContent>
						{() => (
							<>
								<ModalHeader className="flex flex-col gap-1">
									Taxi Details
								</ModalHeader>

								<ModalBody>
									<div className="flex flex-col md:flex-row gap-6">
										<div className="w-full md:w-1/3 flex flex-col">
											<div className="flex flex-col items-center mb-4">
												<div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-2">
													<Icon
														className="text-primary text-4xl"
														icon="lucide:car"
													/>
												</div>
												<h3 className="text-xl font-semibold">
													{selectedTaxi.licensePlate}
												</h3>
												<p className="text-default-500">
													{selectedTaxi.model}
												</p>
											</div>

											<div className="mt-2 text-center">
												<p className="text-sm text-default-500">Status</p>
												<div className="mt-1">
													{renderStatusChip(selectedTaxi.status)}
												</div>
											</div>

											<div className="mt-4">
												<Card>
													<CardBody className="p-3">
														<h4 className="font-medium mb-2 text-sm">
															Vehicle Information
														</h4>
														<div className="space-y-2 text-sm">
															<div className="flex justify-between">
																<span className="text-default-500">
																	Capacity:
																</span>
																<span>
																	{selectedTaxi.capacity} seats
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-default-500">
																	Rating:
																</span>
																<span className="flex items-center gap-1">
																	<Icon
																		className="text-yellow-500"
																		icon="lucide:star"
																	/>
																	{selectedTaxi.rating}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-default-500">
																	Route:
																</span>
																<span>
																	{selectedTaxi.routeId ||
																		"Not assigned"}
																</span>
															</div>
														</div>
													</CardBody>
												</Card>
											</div>
										</div>

										<div className="w-full md:w-2/3 space-y-4">
											<Tabs aria-label="Taxi details tabs">
												<Tab
													key="driver"
													title={
														<div className="flex items-center gap-2">
															<Icon icon="lucide:user" />
															Driver
														</div>
													}>
													<Card>
														<CardBody>
															{getDriverInfo(selectedTaxi.driver) ? (
																<div className="space-y-4">
																	<div className="flex items-center gap-3">
																		<Image
																			alt={
																				selectedTaxi.driver
																			}
																			className="w-12 h-12 rounded-full"
																			height={48}
																			src={
																				getDriverInfo(
																					selectedTaxi.driver,
																				)?.avatar ||
																				"/default-avatar.png"
																			}
																			width={48}
																		/>
																		<div>
																			<h4 className="font-medium">
																				{
																					selectedTaxi.driver
																				}
																			</h4>
																			<p className="text-default-500 text-sm">
																				{selectedTaxi.phone ||
																					"No phone number"}
																			</p>
																		</div>
																		<Button
																			className="ml-auto"
																			size="sm"
																			variant="flat">
																			Contact
																		</Button>
																	</div>

																	<div className="grid grid-cols-2 gap-2 text-sm">
																		<div>
																			<p className="text-default-500">
																				Status
																			</p>
																			<p className="font-medium">
																				{
																					getDriverInfo(
																						selectedTaxi.driver,
																					)?.status
																				}
																			</p>
																		</div>
																		<div>
																			<p className="text-default-500">
																				Total Trips
																			</p>
																			<p className="font-medium">
																				{
																					getDriverInfo(
																						selectedTaxi.driver,
																					)?.totalTrips
																				}
																			</p>
																		</div>
																		<div>
																			<p className="text-default-500">
																				Rating
																			</p>
																			<div className="flex items-center gap-1">
																				<Icon
																					className="text-yellow-500"
																					icon="lucide:star"
																				/>
																				<span>
																					{
																						getDriverInfo(
																							selectedTaxi.driver,
																						)?.rating
																					}
																				</span>
																			</div>
																		</div>
																		<div>
																			<p className="text-default-500">
																				Join Date
																			</p>
																			<p className="font-medium">
																				{new Date(
																					getDriverInfo(
																						selectedTaxi.driver,
																					)?.joinDate ||
																						"",
																				).toLocaleDateString()}
																			</p>
																		</div>
																	</div>
																</div>
															) : (
																<div className="text-center py-8">
																	<Icon
																		className="mx-auto text-4xl text-default-400 mb-2"
																		icon="lucide:user-x"
																	/>
																	<p className="text-default-500">
																		No driver information
																		available
																	</p>
																</div>
															)}
														</CardBody>
													</Card>
												</Tab>

												<Tab
													key="documents"
													title={
														<div className="flex items-center gap-2">
															<Icon icon="lucide:file-text" />
															Documents
														</div>
													}>
													<Card>
														<CardBody>
															{getTaxiDocuments(selectedTaxi.id)
																.length > 0 ? (
																<Table aria-label="Taxi documents">
																	<TableHeader>
																		<TableColumn>
																			DOCUMENT TYPE
																		</TableColumn>
																		<TableColumn>
																			FILENAME
																		</TableColumn>
																		<TableColumn>
																			EXPIRY DATE
																		</TableColumn>
																		<TableColumn>
																			STATUS
																		</TableColumn>
																		<TableColumn>
																			ACTION
																		</TableColumn>
																	</TableHeader>
																	<TableBody
																		items={getTaxiDocuments(
																			selectedTaxi.id,
																		)}>
																		{(doc) => (
																			<TableRow key={doc.id}>
																				<TableCell className="capitalize">
																					{doc.type}
																				</TableCell>
																				<TableCell>
																					{doc.fileName}
																				</TableCell>
																				<TableCell>
																					{new Date(
																						doc.expiryDate,
																					).toLocaleDateString()}
																				</TableCell>
																				<TableCell>
																					<Chip
																						color={
																							doc.status ===
																							"verified"
																								? "success"
																								: doc.status ===
																									  "pending"
																									? "warning"
																									: "danger"
																						}
																						size="sm">
																						{doc.status}
																					</Chip>
																				</TableCell>
																				<TableCell>
																					<Button
																						size="sm"
																						variant="light">
																						View
																					</Button>
																				</TableCell>
																			</TableRow>
																		)}
																	</TableBody>
																</Table>
															) : (
																<div className="text-center py-8">
																	<Icon
																		className="mx-auto text-4xl text-default-400 mb-2"
																		icon="lucide:file-x"
																	/>
																	<p className="text-default-500">
																		No documents available
																	</p>
																</div>
															)}

															<Button
																className="mt-4"
																color="primary"
																startContent={
																	<Icon icon="lucide:upload" />
																}>
																Upload Document
															</Button>
														</CardBody>
													</Card>
												</Tab>

												<Tab
													key="location"
													title={
														<div className="flex items-center gap-2">
															<Icon icon="lucide:map-pin" />
															Location
														</div>
													}>
													<Card>
														<CardBody>
															{selectedTaxi.location ? (
																<div className="space-y-4">
																	<div className="h-64 bg-default-100 rounded-lg flex items-center justify-center">
																		<p className="text-default-500">
																			Map showing current
																			location at coordinates:
																			{
																				selectedTaxi
																					.location.lat
																			}
																			,{" "}
																			{
																				selectedTaxi
																					.location.lng
																			}
																		</p>
																	</div>

																	<div className="grid grid-cols-2 gap-4">
																		<div>
																			<p className="text-default-500 text-sm">
																				Last Updated
																			</p>
																			<p className="font-medium">
																				Today, 10:35 AM
																			</p>
																		</div>
																		<div>
																			<p className="text-default-500 text-sm">
																				ETA to Rank
																			</p>
																			<p className="font-medium">
																				{selectedTaxi.eta ||
																					"N/A"}
																			</p>
																		</div>
																	</div>

																	<Button
																		color="primary"
																		size="sm">
																		Track Live Location
																	</Button>
																</div>
															) : (
																<div className="text-center py-8">
																	<Icon
																		className="mx-auto text-4xl text-default-400 mb-2"
																		icon="lucide:map-off"
																	/>
																	<p className="text-default-500">
																		Location tracking not
																		available
																	</p>
																</div>
															)}
														</CardBody>
													</Card>
												</Tab>

												<Tab
													key="maintenance"
													title={
														<div className="flex items-center gap-2">
															<Icon icon="lucide:tool" />
															Maintenance
														</div>
													}>
													<Card>
														<CardBody>
															<div className="space-y-4">
																<div className="flex justify-between items-center">
																	<h3 className="font-medium">
																		Maintenance History
																	</h3>
																	<Button
																		color="primary"
																		size="sm"
																		variant="flat">
																		Schedule Service
																	</Button>
																</div>

																<div className="text-center py-8">
																	<Icon
																		className="mx-auto text-4xl text-default-400 mb-2"
																		icon="lucide:clipboard-check"
																	/>
																	<p className="text-default-500">
																		No maintenance records found
																	</p>
																	<Button
																		className="mt-2"
																		color="primary"
																		size="sm"
																		variant="flat">
																		Add Maintenance Record
																	</Button>
																</div>
															</div>
														</CardBody>
													</Card>
												</Tab>
											</Tabs>
										</div>
									</div>
								</ModalBody>

								<ModalFooter>
									<Button
										color="danger"
										variant="flat"
										onPress={() =>
											handleStatusChange(selectedTaxi.id, "offline")
										}>
										{selectedTaxi.status === "offline"
											? "Set Available"
											: "Set Offline"}
									</Button>
									<Button color="primary" onPress={onClose}>
										Close
									</Button>
								</ModalFooter>
							</>
						)}
					</ModalContent>
				</Modal>
			)}
		</div>
	);
}
