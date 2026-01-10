"use client";
import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	Breadcrumbs,
	BreadcrumbItem,
	Button,
	Table,
	TableHeader,
	TableBody,
	TableColumn,
	TableRow,
	TableCell,
	Chip,
	Input,
	Pagination,
	Select,
	SelectItem,
	User,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/toast";

// Import mock data
import { supportTickets, adminUsers } from "@/lib/data";
import { iSupportTicket } from "@/types";

export default function TicketsPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [filteredTickets, setFilteredTickets] = useState<iSupportTicket[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [assigneeFilter, setAssigneeFilter] = useState("all");

	// Items per page
	const rowsPerPage = 10;

	// Filter tickets
	useEffect(() => {
		setIsLoading(true);

		// Simulate API call delay
		setTimeout(() => {
			let filtered = [...supportTickets];

			// Apply status filter
			if (statusFilter !== "all") {
				filtered = filtered.filter((ticket) => ticket.status === statusFilter);
			}

			// Apply priority filter
			if (priorityFilter !== "all") {
				filtered = filtered.filter((ticket) => ticket.priority === priorityFilter);
			}

			// Apply assignee filter
			if (assigneeFilter !== "all") {
				if (assigneeFilter === "unassigned") {
					filtered = filtered.filter((ticket) => ticket.assignedTo === null);
				} else {
					filtered = filtered.filter((ticket) => ticket.assignedTo === assigneeFilter);
				}
			}

			// Apply search query filter
			if (searchQuery) {
				filtered = filtered.filter(
					(ticket) =>
						ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
						ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
						ticket.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
						ticket.description.toLowerCase().includes(searchQuery.toLowerCase()),
				);
			}

			setFilteredTickets(
				filtered.map((ticket) => ({
					...ticket,
					status: ticket.status as "open" | "in-progress" | "resolved" | "closed",
					priority: ticket.priority as "low" | "medium" | "high",
				})),
			);
			setIsLoading(false);
		}, 500);
	}, [searchQuery, statusFilter, priorityFilter, assigneeFilter]);

	// Pagination calculation
	const pages = Math.ceil(filteredTickets.length / rowsPerPage);
	const paginatedTickets = filteredTickets.slice(
		(currentPage - 1) * rowsPerPage,
		currentPage * rowsPerPage,
	);

	// Handle ticket assignment
	const handleAssignTicket = (ticketId: string, userId: string) => {
		// In a real app, this would make an API call
		const assignedUser = adminUsers.find((user) => user.id === userId);

		if (assignedUser) {
			addToast({
				title: "Ticket Assigned",
				description: `Ticket assigned to ${assignedUser.name}`,
				color: "success",
			});
		}
	};

	// Handle ticket status change
	const handleStatusChange = (ticketId: string, newStatus: string) => {
		// In a real app, this would make an API call
		addToast({
			title: "Ticket Updated",
			description: `Ticket status changed to ${newStatus}`,
			color: "success",
		});
	};

	// Helper for status color
	const getStatusColor = (status: string) => {
		switch (status) {
			case "open":
				return "primary";
			case "in-progress":
				return "warning";
			case "resolved":
				return "success";
			case "closed":
				return "default";
			default:
				return "default";
		}
	};

	// Helper for priority color
	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "low":
				return "success";
			case "medium":
				return "warning";
			case "high":
				return "danger";
			default:
				return "default";
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Support Tickets</h1>
					<Breadcrumbs>
						<BreadcrumbItem>Admin</BreadcrumbItem>
						<BreadcrumbItem>Dashboard</BreadcrumbItem>
						<BreadcrumbItem>Support</BreadcrumbItem>
						<BreadcrumbItem>Tickets</BreadcrumbItem>
					</Breadcrumbs>
				</div>

				<div className="flex gap-2">
					<Button
						color="primary"
						startContent={<Icon icon="lucide:bar-chart" />}
						variant="flat">
						View Analytics
					</Button>
					<Button color="primary" startContent={<Icon icon="lucide:plus" />}>
						Create Ticket
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="shadow-sm">
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-default-500">Open Tickets</p>
								<p className="text-2xl font-bold mt-1">
									{supportTickets.filter((t) => t.status === "open").length}
								</p>
							</div>
							<div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
								<Icon
									className="text-primary text-2xl"
									icon="lucide:alert-circle"
								/>
							</div>
						</div>
					</CardBody>
				</Card>

				<Card className="shadow-sm">
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-default-500">In Progress</p>
								<p className="text-2xl font-bold mt-1">
									{
										supportTickets.filter((t) => t.status === "in-progress")
											.length
									}
								</p>
							</div>
							<div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
								<Icon className="text-warning text-2xl" icon="lucide:hourglass" />
							</div>
						</div>
					</CardBody>
				</Card>

				<Card className="shadow-sm">
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-default-500">Resolved Today</p>
								<p className="text-2xl font-bold mt-1">
									{Math.floor(Math.random() * 5) + 1}
								</p>
							</div>
							<div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
								<Icon
									className="text-success text-2xl"
									icon="lucide:check-circle"
								/>
							</div>
						</div>
					</CardBody>
				</Card>

				<Card className="shadow-sm">
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-default-500">Avg. Response Time</p>
								<p className="text-2xl font-bold mt-1">2.4 hrs</p>
							</div>
							<div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center">
								<Icon className="text-danger text-2xl" icon="lucide:clock" />
							</div>
						</div>
					</CardBody>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardBody className="p-4">
					<div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
						<div className="flex gap-3 flex-col sm:flex-row w-full">
							<Input
								classNames={{
									base: "w-full sm:w-[260px]",
									inputWrapper: "h-10",
								}}
								placeholder="Search tickets..."
								startContent={<Icon icon="lucide:search" />}
								value={searchQuery}
								onValueChange={setSearchQuery}
							/>

							<div className="flex gap-2">
								<Select
									className="w-full sm:w-[160px]"
									placeholder="Status"
									selectedKeys={[statusFilter]}
									onSelectionChange={(keys) =>
										setStatusFilter(Array.from(keys)[0] as string)
									}>
									<SelectItem key="all">All Statuses</SelectItem>
									<SelectItem key="open">Open</SelectItem>
									<SelectItem key="in-progress">In Progress</SelectItem>
									<SelectItem key="resolved">Resolved</SelectItem>
									<SelectItem key="closed">Closed</SelectItem>
								</Select>

								<Select
									className="w-full sm:w-[160px]"
									placeholder="Priority"
									selectedKeys={[priorityFilter]}
									onSelectionChange={(keys) =>
										setPriorityFilter(Array.from(keys)[0] as string)
									}>
									<SelectItem key="all">All Priorities</SelectItem>
									<SelectItem key="high">High</SelectItem>
									<SelectItem key="medium">Medium</SelectItem>
									<SelectItem key="low">Low</SelectItem>
								</Select>

								<Select
									className="w-full sm:w-[160px]"
									placeholder="Assignee"
									selectedKeys={[assigneeFilter]}
									onSelectionChange={(keys) =>
										setAssigneeFilter(Array.from(keys)[0] as string)
									}>
									<SelectItem key="all">All Assignees</SelectItem>
									<SelectItem key="unassigned">Unassigned</SelectItem>
									<>
										{adminUsers.map((user) => (
											<SelectItem key={user.id}>{user.name}</SelectItem>
										))}
									</>
								</Select>
							</div>
						</div>

						<div className="flex gap-3">
							<Button
								color="primary"
								startContent={<Icon icon="lucide:refresh-cw" />}
								variant="flat">
								Refresh
							</Button>
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Tickets Table */}
			<Card>
				<CardBody>
					<Table
						aria-label="Support tickets table"
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
							<TableColumn>TICKET</TableColumn>
							<TableColumn>CUSTOMER</TableColumn>
							<TableColumn>CATEGORY</TableColumn>
							<TableColumn>PRIORITY</TableColumn>
							<TableColumn>STATUS</TableColumn>
							<TableColumn>ASSIGNED TO</TableColumn>
							<TableColumn>DATE</TableColumn>
							<TableColumn>ACTIONS</TableColumn>
						</TableHeader>

						<TableBody
							emptyContent={<div className="text-center">No tickets found</div>}
							isLoading={isLoading}
							items={paginatedTickets}
							loadingContent={<div className="text-center">Loading tickets...</div>}>
							{(ticket) => (
								<TableRow key={ticket.id}>
									<TableCell>
										<div>
											<p className="font-medium">{ticket.subject}</p>
											<p className="text-xs text-default-500">
												ID: {ticket.id}
											</p>
										</div>
									</TableCell>
									<TableCell>
										<div>
											<p>{ticket.customerName}</p>
											<p className="text-xs text-default-500">
												{ticket.customerEmail}
											</p>
										</div>
									</TableCell>
									<TableCell>{ticket.category}</TableCell>
									<TableCell>
										<Chip
											color={getPriorityColor(ticket.priority)}
											size="sm"
											variant="flat">
											{ticket.priority}
										</Chip>
									</TableCell>
									<TableCell>
										<Chip
											color={getStatusColor(ticket.status)}
											size="sm"
											variant="flat">
											{ticket.status}
										</Chip>
									</TableCell>
									<TableCell>
										{ticket.assignedTo ? (
											<User
												avatarProps={{
													src:
														adminUsers.find(
															(user) => user.id === ticket.assignedTo,
														)?.avatar || "",
													size: "sm",
												}}
												name={
													adminUsers.find(
														(user) => user.id === ticket.assignedTo,
													)?.name || "Unassigned"
												}
											/>
										) : (
											<span className="text-default-400">Unassigned</span>
										)}
									</TableCell>
									<TableCell>
										{new Date(ticket.createdDate).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button
												isIconOnly
												size="sm"
												variant="light"
												onPress={() =>
													window.open(
														`/dashboard/support/tickets/${ticket.id}`,
														"_blank",
													)
												}>
												<Icon icon="lucide:eye" />
											</Button>

											<Select
												aria-label="Actions"
												className="w-24"
												classNames={{
													trigger: "min-h-8 h-8 py-0",
												}}
												defaultSelectedKeys={["actions"]}
												size="sm">
												<SelectItem key="actions" textValue="Actions">
													Actions
												</SelectItem>
												<>
													{!ticket.assignedTo && (
														<SelectItem
															key="assign"
															onPress={() =>
																handleAssignTicket(
																	ticket.id,
																	"admin3",
																)
															}>
															Assign to me
														</SelectItem>
													)}
													{ticket.status === "open" && (
														<SelectItem
															key="start"
															onPress={() =>
																handleStatusChange(
																	ticket.id,
																	"in-progress",
																)
															}>
															Start working
														</SelectItem>
													)}
													{ticket.status === "in-progress" && (
														<SelectItem
															key="resolve"
															onPress={() =>
																handleStatusChange(
																	ticket.id,
																	"resolved",
																)
															}>
															Mark resolved
														</SelectItem>
													)}
													<SelectItem key="email">
														Email customer
													</SelectItem>
													<SelectItem key="close">
														Close ticket
													</SelectItem>
												</>
											</Select>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardBody>
			</Card>

			{/* Quick Filters */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Button
					className="w-full"
					color={statusFilter === "open" ? "primary" : "default"}
					startContent={<Icon icon="lucide:alert-circle" />}
					variant={statusFilter === "open" ? "solid" : "flat"}
					onPress={() => setStatusFilter(statusFilter === "open" ? "all" : "open")}>
					Open Tickets
				</Button>

				<Button
					className="w-full"
					color={priorityFilter === "high" ? "danger" : "default"}
					startContent={<Icon icon="lucide:alert-triangle" />}
					variant={priorityFilter === "high" ? "solid" : "flat"}
					onPress={() => setPriorityFilter(priorityFilter === "high" ? "all" : "high")}>
					High Priority
				</Button>

				<Button
					className="w-full"
					color={assigneeFilter === "unassigned" ? "warning" : "default"}
					startContent={<Icon icon="lucide:help-circle" />}
					variant={assigneeFilter === "unassigned" ? "solid" : "flat"}
					onPress={() =>
						setAssigneeFilter(assigneeFilter === "unassigned" ? "all" : "unassigned")
					}>
					Unassigned
				</Button>

				<Button
					className="w-full"
					color={assigneeFilter === "admin3" ? "success" : "default"}
					startContent={<Icon icon="lucide:user" />}
					variant={assigneeFilter === "admin3" ? "solid" : "flat"}
					onPress={() =>
						setAssigneeFilter(assigneeFilter === "admin3" ? "all" : "admin3")
					}>
					My Tickets
				</Button>
			</div>
		</div>
	);
}
