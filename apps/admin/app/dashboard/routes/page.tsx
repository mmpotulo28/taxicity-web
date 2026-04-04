"use client";
import React, { useState, useCallback } from "react";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pagination } from "@heroui/pagination";
import { Chip } from "@heroui/chip";
import { addToast } from "@heroui/toast";

// Import mock data (fallback)
import { routes as mockRoutes, ranks } from "@/lib/data";
import { useRoutes, RouteWithRanks } from "@/hooks/useRoutes";

export default function RoutesPage() {
	const { routes: realRoutes } = useRoutes();
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<string | null>(null);

	const router = useRouter();



	// Combine routes data with rank information
	const dataToUse = realRoutes && realRoutes.length > 0 ? realRoutes : null;
	 
	let routesWithRanks: RouteWithRanks[] = [];

	if (dataToUse) {
		routesWithRanks = dataToUse.map(r => ({
			...r,
			id: r.id,
			name: r.name,
			originRank: r.sourceRank,
			destRank: r.destRank,
			estimatedDuration: r.estimatedDuration ? r.estimatedDuration : 0,
			estimatedFare: r.baseFare ? Number(r.baseFare).toFixed(2) : 0,
			distance: r.distance ? r.distance : 0,
			status: "ACTIVE" // Default for now if status isn't on Route model, or check schema
		}));
	}

	// Filter routes based on search query and status
	const filteredRoutes = routesWithRanks.filter((route) => {
		const matchesSearch =
			route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(route.sourceRank?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleEdit = (route: any) => {
		router.push(`/dashboard/routes/${route.id}`);
	};

	const handleSaveRoute = async () => { };

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
			{/* Modal-based editing removed: use subpages for editing */}

			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Routes Management</h1>
					<Breadcrumbs>
						<BreadcrumbItem href="/secure/dashboard">Dashboard</BreadcrumbItem>
						<BreadcrumbItem>Routes</BreadcrumbItem>
					</Breadcrumbs>
				</div>

				<Link href="/dashboard/routes/new">
					<Button color="primary" startContent={<Icon icon="lucide:plus" />}>
						Add New Route
					</Button>
				</Link>
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
											{route.sourceRank?.name || "Unknown"}
										</td>
										<td className="py-4 px-4">
											{route.destRank?.name || "Unknown"}
										</td>
										<td className="py-4 px-4">{route.distance}</td>
										<td className="py-4 px-4">R{route.baseFare.toString()}</td>
										<td className="py-4 px-4">{route.estimatedDuration}</td>
										<td className="py-4 px-4">
											<Chip color={getStatusColor(route.status)} size="sm">
												{route.status}
											</Chip>
										</td>
										<td className="py-4 px-4">
											<div className="flex gap-2">
												<Link href={`/dashboard/routes/${route.id}`}>
													<Button
														isIconOnly
														size="sm"
														variant="light"
														color="primary">
														<Icon icon="lucide:eye" />
													</Button>
												</Link>

												<Button
													isIconOnly
													size="sm"
													variant="light"
													onPress={() => handleEdit(route)}>
													<Icon icon="lucide:edit-2" />
												</Button>

												<Button
													isIconOnly
													color={
														route.status === "ACTIVE"
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
															route.status === "ACTIVE"
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
							<span className="font-medium">{routesWithRanks.length}</span> routes
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
