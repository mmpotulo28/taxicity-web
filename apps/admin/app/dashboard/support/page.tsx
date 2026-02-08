"use client";
import React, { useState, useEffect } from "react";
import {
	Card,
	CardBody,
	CardHeader,
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
	useDisclosure,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Textarea,
	Divider,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	User,
	Select,
	SelectItem,
	Tabs,
	Tab,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// Import mock data (fallback)
import { supportTickets as mockSupportTickets, adminUsers } from "@/lib/data";
import { iSupportTicket } from "@/types";
import { useSupportTickets } from "@/hooks/useSupportTickets";

export default function SupportPage() {
	const { user } = useUser();
	const { tickets: realTickets, isLoading: isTicketsLoading } = useSupportTickets();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [filteredTickets, setFilteredTickets] = useState<iSupportTicket[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedTicket, setSelectedTicket] = useState<iSupportTicket | null>(null);
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [replyText, setReplyText] = useState("");
	const [ticketNotes, setTicketNotes] = useState("");
	const [activeTab, setActiveTab] = useState("all");

	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
	const {
		isOpen: isKnowledgeBaseOpen,
		onOpen: onKnowledgeBaseOpen,
		onClose: onKnowledgeBaseClose,
		onOpenChange: onKnowledgeBaseOpenChange,
	} = useDisclosure();

	// Items per page
	const rowsPerPage = 8;

	// Mocked ticket messages
	const [ticketMessages, setTicketMessages] = useState<
		{ sender: string; message: string; timestamp: string; isAdmin: boolean }[]
	>([
		{
			sender: "John Mbeki",
			message: "I made a payment but it's not showing in the system. Can you help?",
			timestamp: "2023-11-19 10:23 AM",
			isAdmin: false,
		},
		{
			sender: "Thandi Nkosi",
			message:
				"Thank you for contacting support. I'll check this for you. Could you please provide your transaction reference number?",
			timestamp: "2023-11-19 10:45 AM",
			isAdmin: true,
		},
		{
			sender: "John Mbeki",
			message: "The reference number is TX789012. It was for R150.00.",
			timestamp: "2023-11-19 11:02 AM",
			isAdmin: false,
		},
	]);

	// Filter tickets
	useEffect(() => {
		if (isTicketsLoading) {
			setIsLoading(true);
			return;
		}

		const sourceData = realTickets && realTickets.length > 0 ? realTickets : null;
		let mappedData: iSupportTicket[] = [];

		if (sourceData) {
			mappedData = sourceData.map((t: any) => ({
				id: t.id,
				subject: t.subject,
				description: t.message || "",
				status: (t.status?.toLowerCase() === "open" ? "open" :
					t.status?.toLowerCase() === "resolved" ? "resolved" :
						t.status?.toLowerCase() === "closed" ? "closed" :
							"in-progress") as any,
				priority: (t.priority?.toLowerCase() === "high" ? "high" :
					t.priority?.toLowerCase() === "low" ? "low" : "medium") as any,
				createdDate: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
				customerName: `User-${t.userId?.substring(0, 6) || "Unknown"}`, // Placeholder
				customerEmail: "user@example.com", // Placeholder
				assignedTo: t.assignedTo || null,
				category: t.category || "General",
				resolution: undefined,
				relatedDriverId: undefined,
				relatedTripId: undefined,
				relatedTaxiId: undefined
			}));
		} else {
			mappedData = mockSupportTickets.map((ticket) => ({
				...ticket,
				status: ticket.status as "open" | "in-progress" | "resolved" | "closed",
				priority: ticket.priority as "low" | "medium" | "high",
			}));
		}

		let filtered = mappedData;

		// Apply status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter((ticket) => ticket.status === statusFilter);
		}

		// Apply priority filter
		if (priorityFilter !== "all") {
			filtered = filtered.filter((ticket) => ticket.priority === priorityFilter);
		}

		// Apply tab filter
		if (activeTab === "my") {
			filtered = filtered.filter((ticket) => ticket.assignedTo === user?.id);
		} else if (activeTab === "unassigned") {
			filtered = filtered.filter((ticket) => ticket.assignedTo === null);
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

		setFilteredTickets(filtered);
		setIsLoading(false);
	}, [searchQuery, statusFilter, priorityFilter, activeTab, realTickets, isTicketsLoading]);


	// Pagination calculation
	const pages = Math.ceil(filteredTickets.length / rowsPerPage);
	const paginatedTickets = filteredTickets.slice(
		(currentPage - 1) * rowsPerPage,
		currentPage * rowsPerPage,
	);

	// View ticket details
	const handleViewTicket = (ticket: iSupportTicket) => {
		setSelectedTicket(ticket);
		onOpen();
	};

	// Handle ticket status change
	const handleStatusChange = (ticketId: string, newStatus: string) => {
		// In a real app, this would make an API call
		addToast({
			title: "Ticket Updated",
			description: `Ticket status changed to ${newStatus}`,
			color: "success",
		});
		onClose();
	};

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

	// Handle reply submission
	const handleSubmitReply = () => {
		if (!replyText.trim()) return;

		// Add the new message
		setTicketMessages([
			...ticketMessages,
			{
				sender: "Thandi Nkosi",
				message: replyText,
				timestamp: new Date().toLocaleString(),
				isAdmin: true,
			},
		]);

		setReplyText("");

		// In a real app, this would make an API call
		addToast({
			title: "Reply Sent",
			description: "Your reply has been sent to the customer",
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

	// Knowledge base articles (mock data)
	const knowledgeBaseArticles = [
		{
			id: "kb1",
			title: "How to troubleshoot payment issues",
			category: "Payments",
			views: 1245,
		},
		{
			id: "kb2",
			title: "Driver registration process",
			category: "Registration",
			views: 982,
		},
		{
			id: "kb3",
			title: "Refund policy and procedures",
			category: "Billing",
			views: 876,
		},
		{
			id: "kb4",
			title: "Taxi tracking features explained",
			category: "Features",
			views: 754,
		},
		{
			id: "kb5",
			title: "Managing user account settings",
			category: "Account",
			views: 623,
		},
	];

	// Navigation handlers
	const handleNavigateToTickets = () => {
		router.push("/dashboard/support/tickets");
	};

	const handleNavigateToKnowledgeBase = () => {
		router.push("/dashboard/support/knowledge-base");
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Support Management</h1>
					<Breadcrumbs>
						<BreadcrumbItem>Admin</BreadcrumbItem>
						<BreadcrumbItem>Dashboard</BreadcrumbItem>
						<BreadcrumbItem>Support</BreadcrumbItem>
					</Breadcrumbs>
				</div>

				<div className="flex gap-2">
					<Button
						color="primary"
						startContent={<Icon icon="lucide:book" />}
						variant="flat"
						onPress={onKnowledgeBaseOpen}>
						Knowledge Base
					</Button>
					<Button color="primary" startContent={<Icon icon="lucide:plus" />}>
						Create Ticket
					</Button>
				</div>
			</div>

			{/* Support Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card className="md:col-span-2 shadow-sm">
					<CardBody className="p-6">
						<h2 className="text-xl font-semibold mb-4">Support Dashboard</h2>
						<p className="text-default-500 mb-6">
							Manage customer support tickets, track issues, and maintain the
							knowledge base for TaxiCity users and drivers.
						</p>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Card
								isPressable
								className="bg-primary-50 dark:bg-primary-900/20"
								onPress={handleNavigateToTickets}>
								<CardBody className="p-4">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
											<Icon
												className="text-primary text-xl"
												icon="lucide:ticket"
											/>
										</div>
										<div>
											<h3 className="font-medium">Ticket Management</h3>
											<p className="text-xs text-default-600">
												Manage all support requests
											</p>
										</div>
									</div>
								</CardBody>
							</Card>

							<Card
								isPressable
								className="bg-success-50 dark:bg-success-900/20"
								onPress={handleNavigateToKnowledgeBase}>
								<CardBody className="p-4">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
											<Icon
												className="text-success text-xl"
												icon="lucide:book"
											/>
										</div>
										<div>
											<h3 className="font-medium">Knowledge Base</h3>
											<p className="text-xs text-default-600">
												Manage help articles and FAQs
											</p>
										</div>
									</div>
								</CardBody>
							</Card>

							<Card isPressable className="bg-warning-50 dark:bg-warning-900/20">
								<CardBody className="p-4">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
											<Icon
												className="text-warning text-xl"
												icon="lucide:bar-chart-2"
											/>
										</div>
										<div>
											<h3 className="font-medium">Support Analytics</h3>
											<p className="text-xs text-default-600">
												View support performance metrics
											</p>
										</div>
									</div>
								</CardBody>
							</Card>
						</div>
					</CardBody>
				</Card>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="shadow-sm">
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-default-500">Open Tickets</p>
								<p className="text-2xl font-bold mt-1">
									{filteredTickets.filter((t) => t.status === "open").length}
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
										filteredTickets.filter((t) => t.status === "in-progress")
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

			<Card>
				<CardHeader className="flex flex-col gap-4">
					<div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
						<div className="flex gap-3 flex-col sm:flex-row">
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
							</div>
						</div>

						<div className="flex gap-3">
							<Button
								color="primary"
								startContent={<Icon icon="lucide:refresh-cw" />}
								variant="flat"
								onPress={handleNavigateToTickets}>
								View All Tickets
							</Button>
						</div>
					</div>

					<Tabs
						aria-label="Ticket tabs"
						color="primary"
						selectedKey={activeTab}
						onSelectionChange={(key) => {
							setActiveTab(key as string);
							setCurrentPage(1);
						}}>
						<Tab key="all" title="All Tickets" />
						<Tab key="my" title="My Tickets" />
						<Tab key="unassigned" title="Unassigned" />
					</Tabs>
				</CardHeader>

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
												onPress={() => handleViewTicket(ticket)}>
												<Icon icon="lucide:eye" />
											</Button>

											<Dropdown>
												<DropdownTrigger>
													<Button isIconOnly size="sm" variant="light">
														<Icon icon="lucide:more-vertical" />
													</Button>
												</DropdownTrigger>
												<DropdownMenu aria-label="Ticket actions">
													<>
														{!ticket.assignedTo && (
															<DropdownItem
																key="assign"
																startContent={
																	<Icon icon="lucide:user-check" />
																}
																onPress={() =>
																	handleAssignTicket(
																		ticket.id,
																		"admin3",
																	)
																}>
																Assign to Me
															</DropdownItem>
														)}
														{ticket.status === "open" && (
															<DropdownItem
																key="start"
																startContent={
																	<Icon icon="lucide:play" />
																}
																onPress={() =>
																	handleStatusChange(
																		ticket.id,
																		"in-progress",
																	)
																}>
																Start Working
															</DropdownItem>
														)}
														{ticket.status === "in-progress" && (
															<DropdownItem
																key="resolve"
																startContent={
																	<Icon icon="lucide:check" />
																}
																onPress={() =>
																	handleStatusChange(
																		ticket.id,
																		"resolved",
																	)
																}>
																Mark Resolved
															</DropdownItem>
														)}
														<DropdownItem
															key="email"
															startContent={
																<Icon icon="lucide:mail" />
															}>
															Email Customer
														</DropdownItem>
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

			{/* Ticket Detail Modal */}
			{selectedTicket && (
				<Modal isOpen={isOpen} size="5xl" onOpenChange={onOpenChange}>
					<ModalContent className="max-h-[90vh] overflow-y-auto">
						{() => (
							<>
								<ModalHeader className="flex flex-col gap-1">
									<div className="flex items-center gap-2">
										{selectedTicket.subject}
										<Chip
											color={getStatusColor(selectedTicket.status)}
											size="sm">
											{selectedTicket.status}
										</Chip>
									</div>
									<p className="text-small text-default-500">
										Ticket ID: {selectedTicket.id}
									</p>
								</ModalHeader>

								<ModalBody className="overflow-hidden">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										<div className="md:col-span-2 space-y-4">
											{/* Conversation History */}
											<h3 className="text-lg font-medium">Conversation</h3>
											<div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
												{ticketMessages.map((msg, index) => (
													<div
														key={index}
														className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}>
														<div
															className={`max-w-[80%] rounded-lg p-3 ${msg.isAdmin
																? "bg-primary-100 text-primary-900"
																: "bg-default-100"
																}`}>
															<div className="flex items-center gap-2 mb-1">
																<span className="font-medium text-sm">
																	{msg.sender}
																</span>
																<span className="text-xs text-default-500">
																	{msg.timestamp}
																</span>
															</div>
															<p className="text-sm">{msg.message}</p>
														</div>
													</div>
												))}
											</div>

											{/* Reply Box */}
											<div className="mt-4">
												<Textarea
													label="Reply"
													minRows={3}
													placeholder="Type your response here..."
													value={replyText}
													onValueChange={setReplyText}
												/>
												<div className="flex justify-end mt-2">
													<Button
														color="primary"
														endContent={<Icon icon="lucide:send" />}
														isDisabled={!replyText.trim()}
														onPress={handleSubmitReply}>
														Send Reply
													</Button>
												</div>
											</div>
										</div>

										<div className="space-y-4">
											{/* Ticket Details */}
											<h3 className="text-lg font-medium">Ticket Details</h3>
											<Card>
												<CardBody className="p-4">
													<div className="space-y-3">
														<div>
															<p className="text-sm text-default-500">
																Customer
															</p>
															<p className="font-medium">
																{selectedTicket.customerName}
															</p>
															<p className="text-xs">
																{selectedTicket.customerEmail}
															</p>
														</div>

														<Divider />

														<div className="grid grid-cols-2 gap-2">
															<div>
																<p className="text-sm text-default-500">
																	Created
																</p>
																<p className="text-sm">
																	{new Date(
																		selectedTicket.createdDate,
																	).toLocaleString()}
																</p>
															</div>
															<div>
																<p className="text-sm text-default-500">
																	Category
																</p>
																<p className="text-sm">
																	{selectedTicket.category}
																</p>
															</div>
														</div>

														<div className="grid grid-cols-2 gap-2">
															<div>
																<p className="text-sm text-default-500">
																	Priority
																</p>
																<Chip
																	color={getPriorityColor(
																		selectedTicket.priority,
																	)}
																	size="sm"
																	variant="flat">
																	{selectedTicket.priority}
																</Chip>
															</div>
															<div>
																<p className="text-sm text-default-500">
																	Status
																</p>
																<Select
																	className="max-w-xs"
																	selectedKeys={[
																		selectedTicket.status,
																	]}
																	size="sm"
																	onChange={(e) =>
																		handleStatusChange(
																			selectedTicket.id,
																			e.target.value,
																		)
																	}>
																	<SelectItem key="open">
																		Open
																	</SelectItem>
																	<SelectItem key="in-progress">
																		In Progress
																	</SelectItem>
																	<SelectItem key="resolved">
																		Resolved
																	</SelectItem>
																	<SelectItem key="closed">
																		Closed
																	</SelectItem>
																</Select>
															</div>
														</div>

														<Divider />

														<div>
															<p className="text-sm text-default-500">
																Assigned To
															</p>
															{selectedTicket.assignedTo ? (
																<User
																	avatarProps={{
																		src:
																			adminUsers.find(
																				(user) =>
																					user.id ===
																					selectedTicket.assignedTo,
																			)?.avatar || "",
																	}}
																	name={
																		adminUsers.find(
																			(user) =>
																				user.id ===
																				selectedTicket.assignedTo,
																		)?.name || "Unassigned"
																	}
																/>
															) : (
																<div className="flex items-center gap-2 mt-1">
																	<Button
																		color="primary"
																		size="sm"
																		variant="flat"
																		onPress={() =>
																			handleAssignTicket(
																				selectedTicket.id,
																				"admin3",
																			)
																		}>
																		Assign to me
																	</Button>
																	<span className="text-default-400">
																		or
																	</span>
																	<Select
																		className="max-w-[150px]"
																		placeholder="Select agent"
																		size="sm"
																		onChange={(e) =>
																			handleAssignTicket(
																				selectedTicket.id,
																				e.target.value,
																			)
																		}>
																		{adminUsers.map((user) => (
																			<SelectItem
																				key={user.id}>
																				{user.name}
																			</SelectItem>
																		))}
																	</Select>
																</div>
															)}
														</div>

														<Divider />

														<div>
															<p className="text-sm text-default-500 mb-1">
																Description
															</p>
															<p className="text-sm">
																{selectedTicket.description}
															</p>
														</div>

														{/* Related Information */}
														{(selectedTicket.relatedDriverId ||
															selectedTicket.relatedTripId ||
															selectedTicket.relatedTaxiId) && (
																<>
																	<Divider />
																	<div>
																		<p className="text-sm text-default-500 mb-1">
																			Related Information
																		</p>
																		{selectedTicket.relatedDriverId && (
																			<div className="flex items-center gap-2 mb-1">
																				<Icon
																					className="text-default-500"
																					icon="lucide:user"
																				/>
																				<a
																					className="text-sm text-primary"
																					href={`/dashboard/drivers?id=${selectedTicket.relatedDriverId}`}>
																					View Related Driver
																				</a>
																			</div>
																		)}
																		{selectedTicket.relatedTripId && (
																			<div className="flex items-center gap-2 mb-1">
																				<Icon
																					className="text-default-500"
																					icon="lucide:map"
																				/>
																				<a
																					className="text-sm text-primary"
																					href={`/dashboard/trips?id=${selectedTicket.relatedTripId}`}>
																					View Related Trip
																				</a>
																			</div>
																		)}
																		{selectedTicket.relatedTaxiId && (
																			<div className="flex items-center gap-2">
																				<Icon
																					className="text-default-500"
																					icon="lucide:car"
																				/>
																				<a
																					className="text-sm text-primary"
																					href={`/dashboard/taxis?id=${selectedTicket.relatedTaxiId}`}>
																					View Related Taxi
																				</a>
																			</div>
																		)}
																	</div>
																</>
															)}
													</div>
												</CardBody>
											</Card>

											{/* Notes Section */}
											<h3 className="text-lg font-medium">Internal Notes</h3>
											<Textarea
												minRows={3}
												placeholder="Add private notes about this ticket (not visible to customer)"
												value={ticketNotes}
												onValueChange={setTicketNotes}
											/>
											<Button
												className="w-full"
												color="primary"
												size="sm"
												startContent={<Icon icon="lucide:save" />}
												variant="flat"
												onPress={() =>
													addToast({
														title: "Notes Saved",
														description:
															"Your notes have been saved successfully",
														color: "success",
													})
												}>
												Save Notes
											</Button>

											{/* Suggested Solutions */}
											<h3 className="text-lg font-medium">
												Suggested Solutions
											</h3>
											<Card>
												<CardBody className="p-3">
													<div className="space-y-2">
														<button
															className="p-2 hover:bg-default-100 rounded cursor-pointer"
															onClick={() =>
																setReplyText(
																	"I've checked your payment and found the issue. The transaction was successful but took longer than usual to reflect. It should now be visible in your account. Please refresh the app and let me know if you can see it now.",
																)
															}>
															<p className="font-medium text-sm">
																Payment Delay Solution
															</p>
															<p className="text-xs text-default-500">
																Standard response for payment delays
															</p>
														</button>
														<button
															className="p-2 hover:bg-default-100 rounded cursor-pointer"
															onClick={() =>
																setReplyText(
																	"I'll need to check with our finance department about this transaction. Could you please provide the exact date and time of payment, along with any confirmation number you received? I'll investigate this right away.",
																)
															}>
															<p className="font-medium text-sm">
																Payment Investigation
															</p>
															<p className="text-xs text-default-500">
																Request more payment details
															</p>
														</button>
														<button
															className="p-2 hover:bg-default-100 rounded cursor-pointer"
															onClick={() =>
																setReplyText(
																	"Thank you for providing those details. I've located the payment in our system and have applied it to your account. You should now see it reflected in the app. Please let me know if you have any other questions!",
																)
															}>
															<p className="font-medium text-sm">
																Payment Resolution
															</p>
															<p className="text-xs text-default-500">
																Confirmation of payment fix
															</p>
														</button>
													</div>
												</CardBody>
											</Card>
										</div>
									</div>
								</ModalBody>

								<ModalFooter>
									<Button
										color="danger"
										variant="flat"
										onPress={() =>
											handleStatusChange(selectedTicket.id, "closed")
										}>
										Close Ticket
									</Button>
									<Button color="primary" onPress={() => onClose()}>
										Save & Exit
									</Button>
								</ModalFooter>
							</>
						)}
					</ModalContent>
				</Modal>
			)}

			{/* Knowledge Base Modal */}
			<Modal isOpen={isKnowledgeBaseOpen} size="3xl" onOpenChange={onKnowledgeBaseOpenChange}>
				<ModalContent className="max-h-[90vh] overflow-y-auto">
					{() => (
						<>
							<ModalHeader className="flex flex-col gap-1">
								<div className="flex items-center gap-2">
									<Icon icon="lucide:book" />
									Knowledge Base
								</div>
							</ModalHeader>

							<ModalBody>
								<div className="mb-6">
									<Input
										placeholder="Search knowledge base articles..."
										startContent={<Icon icon="lucide:search" />}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
									<Card isPressable>
										<CardBody className="p-3">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
													<Icon
														className="text-primary"
														icon="lucide:credit-card"
													/>
												</div>
												<div>
													<h3 className="font-medium">Payment Issues</h3>
													<p className="text-xs text-default-500">
														8 articles
													</p>
												</div>
											</div>
										</CardBody>
									</Card>

									<Card isPressable>
										<CardBody className="p-3">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
													<Icon
														className="text-success"
														icon="lucide:user-plus"
													/>
												</div>
												<div>
													<h3 className="font-medium">
														Account Management
													</h3>
													<p className="text-xs text-default-500">
														12 articles
													</p>
												</div>
											</div>
										</CardBody>
									</Card>

									<Card isPressable>
										<CardBody className="p-3">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
													<Icon
														className="text-warning"
														icon="lucide:car"
													/>
												</div>
												<div>
													<h3 className="font-medium">Taxi Services</h3>
													<p className="text-xs text-default-500">
														15 articles
													</p>
												</div>
											</div>
										</CardBody>
									</Card>

									<Card isPressable>
										<CardBody className="p-3">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center">
													<Icon
														className="text-danger"
														icon="lucide:shield"
													/>
												</div>
												<div>
													<h3 className="font-medium">
														Safety & Security
													</h3>
													<p className="text-xs text-default-500">
														6 articles
													</p>
												</div>
											</div>
										</CardBody>
									</Card>
								</div>

								<h3 className="text-lg font-medium mb-4">Popular Articles</h3>
								<div className="space-y-4">
									{knowledgeBaseArticles.map((article) => (
										<Card key={article.id} isPressable>
											<CardBody className="p-4">
												<div className="flex justify-between items-start">
													<div>
														<h4 className="font-medium">
															{article.title}
														</h4>
														<div className="flex items-center gap-2 mt-1">
															<Chip size="sm" variant="flat">
																{article.category}
															</Chip>
															<p className="text-xs text-default-500">
																{article.views} views
															</p>
														</div>
													</div>
													<Button isIconOnly size="sm" variant="light">
														<Icon icon="lucide:arrow-right" />
													</Button>
												</div>
											</CardBody>
										</Card>
									))}
								</div>

								<div className="mt-6">
									<Button
										className="w-full"
										color="primary"
										startContent={<Icon icon="lucide:plus" />}
										variant="flat"
										onPress={handleNavigateToKnowledgeBase}>
										View All Articles
									</Button>
								</div>
							</ModalBody>

							<ModalFooter>
								<Button color="default" onPress={onKnowledgeBaseClose}>
									Close
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}
