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
	Select,
	SelectItem,
	User,
	useDisclosure,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/toast";

// Import drivers from data
import { drivers } from "@/lib/data";
import { iDriver } from "@/types";

export default function DriversPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [filteredDrivers, setFilteredDrivers] = useState<iDriver[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedDriver, setSelectedDriver] = useState<iDriver | null>(null);

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

	// Items per page
	const rowsPerPage = 8;

	// Filter and sort drivers
	useEffect(() => {
		setIsLoading(true);

		// Simulate API call delay
		setTimeout(() => {
			let filtered: iDriver[] = drivers.map((driver) => ({
				...driver,
				status: driver.status as "active" | "suspended" | "pending" | "inactive",
			}));

			// Apply search query filter
			if (searchQuery) {
				filtered = filtered.filter(
					(driver) =>
						driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						driver.phone.includes(searchQuery) ||
						driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()),
				);
			}

			// Apply status filter
			if (statusFilter !== "all") {
				filtered = filtered.filter((driver) => driver.status === statusFilter);
			}

			setFilteredDrivers(filtered);
			setIsLoading(false);
		}, 500);
	}, [searchQuery, statusFilter]);

	// Pagination calculation
	const pages = Math.ceil(filteredDrivers.length / rowsPerPage);
	const paginatedDrivers = filteredDrivers.slice(
		(currentPage - 1) * rowsPerPage,
		currentPage * rowsPerPage,
	);

	// Handle driver status change
	const handleStatusChange = (driverId: string, newStatus: string) => {
		addToast({
			title: "Driver Status Updated",
			description: `Driver status changed to ${newStatus}`,
			color: "success",
		});
	};

	// Handle view driver details
	const handleViewDetails = (driver: iDriver) => {
		setSelectedDriver(driver);
		onOpen();
	};

	// Status chip renderer
	const renderStatusChip = (status: string) => {
		let color: "default" | "success" | "warning" | "danger";

		switch (status) {
			case "active":
				color = "success";
				break;
			case "pending":
				color = "warning";
				break;
			case "suspended":
				color = "danger";
				break;
			default:
				color = "default";
		}

		return (
			<Chip color={color} size="sm">
				{status}
			</Chip>
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Driver Management</h1>
					<Breadcrumbs>
						<BreadcrumbItem>Admin</BreadcrumbItem>
						<BreadcrumbItem>Dashboard</BreadcrumbItem>
						<BreadcrumbItem>Drivers</BreadcrumbItem>
					</Breadcrumbs>
				</div>

				<Button color="primary" startContent={<Icon icon="lucide:plus" />}>
					Add New Driver
				</Button>
			</div>

			<Card>
				<CardHeader className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
					<div className="flex gap-3 flex-col sm:flex-row">
						<Input
							classNames={{
								base: "w-full sm:w-[260px]",
								inputWrapper: "h-10",
							}}
							placeholder="Search drivers..."
							startContent={<Icon icon="lucide:search" />}
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>

						<Select
							className="w-full sm:w-[180px]"
							placeholder="Filter by status"
							selectedKeys={[statusFilter]}
							onSelectionChange={(keys) =>
								setStatusFilter(Array.from(keys)[0] as string)
							}>
							<SelectItem key="all">All Statuses</SelectItem>
							<SelectItem key="active">Active</SelectItem>
							<SelectItem key="pending">Pending</SelectItem>
							<SelectItem key="suspended">Suspended</SelectItem>
						</Select>
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
				</CardHeader>

				<CardBody>
					<Table
						aria-label="Driver management table"
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
							<TableColumn>DRIVER</TableColumn>
							<TableColumn>CONTACT</TableColumn>
							<TableColumn>LICENSE</TableColumn>
							<TableColumn>STATUS</TableColumn>
							<TableColumn>RATING</TableColumn>
							<TableColumn>TRIPS</TableColumn>
							<TableColumn>ACTIONS</TableColumn>
						</TableHeader>

						<TableBody
							emptyContent={<div className="text-center">No drivers found</div>}
							isLoading={isLoading}
							items={paginatedDrivers}
							loadingContent={<div className="text-center">Loading drivers...</div>}>
							{(driver) => (
								<TableRow key={driver.id}>
									<TableCell>
										<User
											avatarProps={{ src: driver.avatar }}
											description={`Joined ${new Date(
												driver.joinDate,
											).toLocaleDateString()}`}
											name={driver.name}
										/>
									</TableCell>
									<TableCell>{driver.phone}</TableCell>
									<TableCell>
										<div className="flex flex-col">
											<span className="text-small">
												{driver.licenseNumber}
											</span>
											<span className="text-tiny text-default-500">
												Expires:{" "}
												{new Date(
													driver.licenseExpiry,
												).toLocaleDateString()}
											</span>
										</div>
									</TableCell>
									<TableCell>{renderStatusChip(driver.status)}</TableCell>
									<TableCell>
										<div className="flex items-center gap-1">
											<Icon className="text-yellow-500" icon="lucide:star" />
											<span>{driver.rating}</span>
										</div>
									</TableCell>
									<TableCell>{driver.totalTrips}</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button
												isIconOnly
												size="sm"
												variant="light"
												onPress={() => handleViewDetails(driver)}>
												<Icon icon="lucide:eye" />
											</Button>

											<Dropdown>
												<DropdownTrigger>
													<Button isIconOnly size="sm" variant="light">
														<Icon icon="lucide:more-vertical" />
													</Button>
												</DropdownTrigger>
												<DropdownMenu aria-label="Driver actions">
													<DropdownItem key="edit">
														Edit Driver
													</DropdownItem>
													<DropdownItem key="assign">
														Assign Taxi
													</DropdownItem>
													{driver.status === "active" ? (
														<DropdownItem
															key="suspend"
															color="danger"
															onPress={() =>
																handleStatusChange(
																	driver.id,
																	"suspended",
																)
															}>
															Suspend Driver
														</DropdownItem>
													) : (
														<DropdownItem
															key="activate"
															color="success"
															onPress={() =>
																handleStatusChange(
																	driver.id,
																	"active",
																)
															}>
															Activate Driver
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

			{/* Driver Details Modal */}
			{selectedDriver && (
				<Modal isOpen={isOpen} size="3xl" onOpenChange={onOpenChange}>
					<ModalContent>
						{() => (
							<>
								<ModalHeader className="flex flex-col gap-1">
									Driver Details
								</ModalHeader>

								<ModalBody>
									<div className="flex flex-col md:flex-row gap-6">
										<div className="w-full md:w-1/3 flex flex-col items-center">
											<User
												avatarProps={{
													src: selectedDriver.avatar,
													className: "w-24 h-24",
												}}
												className="justify-center text-center"
												description={`ID: ${selectedDriver.id}`}
												name={selectedDriver.name}
											/>

											<div className="mt-4 text-center">
												<div className="flex items-center justify-center gap-1 mb-2">
													<Icon
														className="text-yellow-500"
														icon="lucide:star"
													/>
													<span className="font-bold text-xl">
														{selectedDriver.rating}
													</span>
												</div>
												<p className="text-default-500">
													{selectedDriver.totalTrips} total trips
												</p>
											</div>

											<div className="mt-6 w-full">
												<p className="text-center mb-2">Status</p>
												<div className="flex justify-center">
													{renderStatusChip(selectedDriver.status)}
												</div>
											</div>
										</div>

										<div className="w-full md:w-2/3 space-y-4">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<p className="text-default-500 text-sm">
														Contact Number
													</p>
													<p className="font-medium">
														{selectedDriver.phone}
													</p>
												</div>

												<div>
													<p className="text-default-500 text-sm">
														Join Date
													</p>
													<p className="font-medium">
														{new Date(
															selectedDriver.joinDate,
														).toLocaleDateString()}
													</p>
												</div>

												<div>
													<p className="text-default-500 text-sm">
														License Number
													</p>
													<p className="font-medium">
														{selectedDriver.licenseNumber}
													</p>
												</div>

												<div>
													<p className="text-default-500 text-sm">
														License Expiry
													</p>
													<p className="font-medium">
														{new Date(
															selectedDriver.licenseExpiry,
														).toLocaleDateString()}
													</p>
												</div>

												<div>
													<p className="text-default-500 text-sm">
														Associated Taxi
													</p>
													<p className="font-medium">
														{selectedDriver.taxiId || "None assigned"}
													</p>
												</div>
											</div>

											<div className="mt-4">
												<h4 className="font-medium mb-2">
													Recent Activity
												</h4>
												<Card>
													<CardBody className="p-3">
														<Table
															hideHeader
															aria-label="Recent driver activity"
															className="text-sm">
															<TableHeader>
																<TableColumn>DATE</TableColumn>
																<TableColumn>ACTIVITY</TableColumn>
															</TableHeader>
															<TableBody>
																<TableRow>
																	<TableCell>
																		Today, 10:30 AM
																	</TableCell>
																	<TableCell>
																		Completed trip from
																		Johannesburg CBD to Sandton
																	</TableCell>
																</TableRow>
																<TableRow>
																	<TableCell>
																		Today, 08:15 AM
																	</TableCell>
																	<TableCell>
																		Started shift at
																		Johannesburg CBD Rank
																	</TableCell>
																</TableRow>
																<TableRow>
																	<TableCell>
																		Yesterday, 5:45 PM
																	</TableCell>
																	<TableCell>
																		Ended shift
																	</TableCell>
																</TableRow>
															</TableBody>
														</Table>
													</CardBody>
												</Card>
											</div>
										</div>
									</div>
								</ModalBody>

								<ModalFooter>
									<Button
										color="danger"
										variant="flat"
										onPress={() =>
											handleStatusChange(selectedDriver.id, "suspended")
										}>
										{selectedDriver.status === "active"
											? "Suspend Driver"
											: "Deactivate Driver"}
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
