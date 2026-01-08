"use client";
import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import {
	Button,
	Input,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Pagination } from "@heroui/pagination";
import { Chip } from "@heroui/chip";
import { addToast } from "@heroui/toast";

// Import mock data
import { routes, ranks } from "@/lib/data";

export default function RoutesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<string | null>(null);

	// Combine routes data with rank information
	const routesWithRanks = routes.map((route) => {
		const originRank = ranks.find((r) => r.id === route.rankId);
		const destRank = route.destinationRankId
			? ranks.find((r) => r.id === route.destinationRankId)
			: null;

		return {
			...route,
			originRank,
			destRank,
		};
	});

	// Filter routes based on search query and status
	const filteredRoutes = routesWithRanks.filter((route) => {
		const matchesSearch =
			route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(route.originRank?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
			(route.destRank?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus = statusFilter ? route.status === statusFilter : true;

		return matchesSearch && matchesStatus;
	});

	const handleStatusChange = (status: string | null) => {
		setStatusFilter(status);
		setCurrentPage(1);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "success";
			case "busy":
				return "warning";
			case "inactive":
				return "danger";
			default:
				return "default";
		}
	};

	const handleEdit = (id: string) => {
		addToast({
			title: "Edit Route",
			description: `Editing route with ID: ${id}`,
			color: "primary",
		});
	};

	const handleToggleStatus = (id: string, currentStatus: string) => {
		// In a real app, this would be an API call
		const newStatus = currentStatus === "active" ? "inactive" : "active";

		addToast({
			title: "Route Status Updated",
			description: `Route status changed to ${newStatus}`,
			color: "success",
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Routes Management</h1>
					<Breadcrumbs>
						<BreadcrumbItem href="/secure/dashboard">Dashboard</BreadcrumbItem>
						<BreadcrumbItem>Routes</BreadcrumbItem>
					</Breadcrumbs>
				</div>

				<Button color="primary" startContent={<Icon icon="lucide:plus" />}>
					Add New Route
				</Button>
			</div>

			<Card className="shadow-sm">
				<CardBody className="p-6">
					{/* Filters and Search */}
					<div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
						<Input
							className="w-full md:w-64"
							placeholder="Search routes..."
							startContent={
								<Icon className="text-default-400" icon="lucide:search" />
							}
							value={searchQuery}
							onValueChange={setSearchQuery}
						/>

						<div className="flex gap-2">
							<Dropdown>
								<DropdownTrigger>
									<Button
										endContent={<Icon icon="lucide:chevron-down" />}
										variant="flat">
										{statusFilter ? `Status: ${statusFilter}` : "All Statuses"}
									</Button>
								</DropdownTrigger>
								<DropdownMenu
									aria-label="Status filter"
									onAction={(key) =>
										handleStatusChange(key === "all" ? null : (key as string))
									}>
									<DropdownItem key="all">All Statuses</DropdownItem>
									<DropdownItem key="active">Active</DropdownItem>
									<DropdownItem key="busy">Busy</DropdownItem>
									<DropdownItem key="inactive">Inactive</DropdownItem>
								</DropdownMenu>
							</Dropdown>

							<Button startContent={<Icon icon="lucide:filter" />} variant="flat">
								More Filters
							</Button>
						</div>
					</div>

					{/* Routes Table */}
					<div className="overflow-x-auto">
						<table className="min-w-full">
							<thead>
								<tr className="border-b border-divider">
									<th className="text-left py-3 px-4 text-default-500 text-sm font-medium">
										Route Name
									</th>
									<th className="text-left py-3 px-4 text-default-500 text-sm font-medium">
										Origin
									</th>
									<th className="text-left py-3 px-4 text-default-500 text-sm font-medium">
										Destination
									</th>
									<th className="text-left py-3 px-4 text-default-500 text-sm font-medium">
										Distance
									</th>
									<th className="text-left py-3 px-4 text-default-500 text-sm font-medium">
										Fare
									</th>
									<th className="text-left py-3 px-4 text-default-500 text-sm font-medium">
										Duration
									</th>
									<th className="text-left py-3 px-4 text-default-500 text-sm font-medium">
										Status
									</th>
									<th className="text-left py-3 px-4 text-default-500 text-sm font-medium">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{filteredRoutes.map((route) => (
									<tr key={route.id} className="border-b border-divider">
										<td className="py-4 px-4">
											<div>
												<p className="font-medium">{route.name}</p>
												<p className="text-xs text-default-500">
													ID: {route.id}
												</p>
											</div>
										</td>
										<td className="py-4 px-4">
											{route.originRank?.name || "Unknown"}
										</td>
										<td className="py-4 px-4">
											{route.destRank?.name || "Unknown"}
										</td>
										<td className="py-4 px-4">{route.distance}</td>
										<td className="py-4 px-4">{route.estimatedFare}</td>
										<td className="py-4 px-4">{route.estimatedDuration}</td>
										<td className="py-4 px-4">
											<Chip color={getStatusColor(route.status)} size="sm">
												{route.status}
											</Chip>
										</td>
										<td className="py-4 px-4">
											<div className="flex gap-2">
												<Button
													isIconOnly
													size="sm"
													variant="light"
													onPress={() => handleEdit(route.id)}>
													<Icon icon="lucide:edit-2" />
												</Button>

												<Button
													isIconOnly
													color={
														route.status === "active"
															? "danger"
															: "success"
													}
													size="sm"
													variant="light"
													onPress={() =>
														handleToggleStatus(route.id, route.status)
													}>
													<Icon
														icon={
															route.status === "active"
																? "lucide:x"
																: "lucide:check"
														}
													/>
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{filteredRoutes.length === 0 && (
						<div className="text-center py-8">
							<Icon
								className="text-4xl text-default-300 mx-auto"
								icon="lucide:route-off"
							/>
							<p className="mt-2 text-default-500">
								No routes found matching your criteria
							</p>
						</div>
					)}

					{/* Pagination */}
					<div className="flex justify-between items-center mt-4">
						<p className="text-sm text-default-500">
							Showing <span className="font-medium">{filteredRoutes.length}</span> of{" "}
							<span className="font-medium">{routes.length}</span> routes
						</p>

						<Pagination
							initialPage={currentPage}
							total={Math.ceil(filteredRoutes.length / 10)}
							onChange={setCurrentPage}
						/>
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
