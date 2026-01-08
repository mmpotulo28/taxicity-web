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
	Avatar,
} from "@heroui/react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/toast";

import { useTaxis } from "@/hooks/useTaxis";
import { Taxi, Driver, TaxiOnRoute, TaxiLocation } from "@taxicity/database";

type TaxiWithRelations = Taxi & {
	driver: Driver | null;
	routes: TaxiOnRoute[];
	currentLocation: TaxiLocation | null;
};

export default function TaxisPage() {
	const { data: taxisRaw, isLoading } = useTaxis();
	const taxis = (taxisRaw || []) as unknown as TaxiWithRelations[];

	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("all");
	const [page, setPage] = useState(1);
	const [selectedTaxi, setSelectedTaxi] = useState<TaxiWithRelations | null>(null);

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

	// Items per page
	const rowsPerPage = 8;

	const filteredTaxis = React.useMemo(() => {
		let filtered = [...taxis];

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(taxi) =>
					taxi.licensePlate.toLowerCase().includes(query) ||
					taxi.model.toLowerCase().includes(query) ||
					(taxi.driver?.fullName || "").toLowerCase().includes(query)
			);
		}

		if (activeTab !== "all") {
			filtered = filtered.filter((taxi) => {
				const s = taxi.status.toLowerCase();
				if (activeTab === "available") return s === "available";
				if (activeTab === "busy") return s === "on_trip" || s === "busy";
				if (activeTab === "offline") return s === "offline";
				return true;
			});
		}

		return filtered;
	}, [taxis, searchQuery, activeTab]);

	const pages = Math.ceil(filteredTaxis.length / rowsPerPage);
	const paginatedTaxis = React.useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		const end = start + rowsPerPage;
		return filteredTaxis.slice(start, end);
	}, [filteredTaxis, page]);

	// Handle taxi status change
	const handleStatusChange = (taxiId: string, newStatus: string) => {
		addToast({
			title: "Taxi Status Updated",
			description: `Taxi status changed to ${newStatus}`,
			color: "success",
		});
	};

	// Handle view taxi details
	const handleViewDetails = (taxi: TaxiWithRelations) => {
		setSelectedTaxi(taxi);
		onOpen();
	};

	// Status chip renderer
	const renderStatusChip = (status: string) => {
		let color;
		const s = status.toLowerCase();

		switch (s) {
			case "available":
				color = "success";
				break;
			case "on_trip":
			case "busy":
				color = "warning";
				break;
			case "offline":
				color = "danger";
				break;
			case "maintenance":
				color = "secondary";
				break;
			default:
				color = "default";
		}

		return (
			<Chip color={color as any} size="sm">
				{s.toUpperCase()}
			</Chip>
		);
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
							setPage(1);
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
										page={page}
										total={pages}
										onChange={(page) => setPage(page)}
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
							{(taxi: TaxiWithRelations) => (
								<TableRow key={taxi.id}>
									<TableCell>
										<div className="flex items-center gap-2">
											<Icon icon="lucide:car" />
											<span className="font-medium">{taxi.licensePlate}</span>
										</div>
									</TableCell>
									<TableCell>{taxi.model}</TableCell>
									<TableCell>{taxi.driver?.fullName || "Unassigned"}</TableCell>
									<TableCell>{taxi.capacity} seats</TableCell>
									<TableCell>{taxi.routes?.length > 0 ? `${taxi.routes.length} Active` : "Not assigned"}</TableCell>
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
													{taxi.status !== "OFFLINE" ? (
														<DropdownItem
															key="offline"
															color="danger"
															onPress={() =>
																handleStatusChange(
																	taxi.id,
																	"OFFLINE",
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
																	"AVAILABLE",
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
																	Make/Model:
																</span>
																<span>
																	{selectedTaxi.make} {selectedTaxi.model}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-default-500">
																	Year:
																</span>
																<span>
																	{selectedTaxi.year || "N/A"}
																</span>
															</div>
															<div className="flex justify-between">
																<span className="text-default-500">
																	Routes:
																</span>
																<span>
																	{selectedTaxi.routes?.length ||
																		"0"}
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
															{selectedTaxi.driver ? (
																<div className="space-y-4">
																	<div className="flex items-center gap-3">
																		<Avatar
																			name={selectedTaxi.driver.fullName || "Unassigned"}
																			src={selectedTaxi.driver.profileImage || undefined}
																		/>
																		<div>
																			<h4 className="font-medium">
																				{selectedTaxi.driver.fullName}
																			</h4>
																			<p className="text-default-500 text-sm">
																				{selectedTaxi.driver.phone ||
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
																				{selectedTaxi.driver.status}
																			</p>
																		</div>
																		<div>
																			<p className="text-default-500">
																				License
																			</p>
																			<p className="font-medium">
																				{selectedTaxi.driver.licenseNumber}
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
															<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
																{selectedTaxi.registrationDoc && (
																	<div className="flex items-center justify-between p-3 border rounded-lg">
																		<div className="flex items-center gap-2">
																			<Icon icon="lucide:file-text" />
																			<span>Registration</span>
																		</div>
																		<Button size="sm" variant="light" onPress={() => window.open(selectedTaxi.registrationDoc!, '_blank')}>View</Button>
																	</div>
																)}
																{selectedTaxi.insuranceDoc && (
																	<div className="flex items-center justify-between p-3 border rounded-lg">
																		<div className="flex items-center gap-2">
																			<Icon icon="lucide:shield-check" />
																			<span>Insurance</span>
																		</div>
																		<Button size="sm" variant="light" onPress={() => window.open(selectedTaxi.insuranceDoc!, '_blank')}>View</Button>
																	</div>
																)}
																{selectedTaxi.permitDoc && (
																	<div className="flex items-center justify-between p-3 border rounded-lg">
																		<div className="flex items-center gap-2">
																			<Icon icon="lucide:badge-check" />
																			<span>Permit</span>
																		</div>
																		<Button size="sm" variant="light" onPress={() => window.open(selectedTaxi.permitDoc!, '_blank')}>View</Button>
																	</div>
																)}
																{(!selectedTaxi.registrationDoc && !selectedTaxi.insuranceDoc && !selectedTaxi.permitDoc) && (
																	<div className="col-span-2 text-center py-4 text-default-500">No documents available</div>
																)}
															</div>

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
															{selectedTaxi.currentLocation ? (
																<div className="space-y-4">
																	<div className="h-64 bg-default-100 rounded-lg flex items-center justify-center">
																		<p className="text-default-500">
																			Map coordinates:{" "}
																			{selectedTaxi.currentLocation.lat.toFixed(4)},{" "}
																			{selectedTaxi.currentLocation.lng.toFixed(4)}
																		</p>
																	</div>

																	<div className="grid grid-cols-2 gap-4">
																		<div>
																			<p className="text-default-500 text-sm">
																				Last Updated
																			</p>
																			<p className="font-medium">
																				{new Date(selectedTaxi.currentLocation.createdAt).toLocaleTimeString()}
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
																		icon="lucide:map-pin-off"
																	/>
																	<p className="text-default-500">
																		No location data available
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
											handleStatusChange(
												selectedTaxi.id,
												selectedTaxi.status === "OFFLINE" ? "AVAILABLE" : "OFFLINE"
											)
										}>
										{selectedTaxi.status === "OFFLINE"
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
