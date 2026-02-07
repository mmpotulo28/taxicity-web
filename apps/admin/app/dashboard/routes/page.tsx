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
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Pagination } from "@heroui/pagination";
import { Chip } from "@heroui/chip";
import { addToast } from "@heroui/toast";

// Import mock data (fallback)
import { routes as mockRoutes, ranks } from "@/lib/data";
import { useRoutes, RouteWithRanks } from "@/hooks/useRoutes";
import RouteBuilderMap from "@/components/routes/RouteBuilderMap";

export default function RoutesPage() {
	const { routes: realRoutes, updateRoute } = useRoutes();
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<string | null>(null);

	// Modal state
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [selectedRoute, setSelectedRoute] = useState<RouteWithRanks | null>(null);
	const [routeUpdates, setRouteUpdates] = useState<{
		polyline?: string;
		distance?: number;
		duration?: number;
		summary?: string;
	} | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const handleRouteChanged = useCallback((data: {
		polyline: string;
		distance: number;
		duration: number;
		summary: string;
	}) => {
		setRouteUpdates({
			polyline: data.polyline,
			distance: parseFloat((data.distance / 1000).toFixed(2)), // meters -> km
			duration: Math.ceil(data.duration / 60), // seconds -> minutes
			summary: data.summary
		});
	}, []);

	// Combine routes data with rank information
	const dataToUse = realRoutes && realRoutes.length > 0 ? realRoutes : null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let routesWithRanks: any[] = [];

	if (dataToUse) {
		routesWithRanks = dataToUse.map(r => ({
			...r,
			id: r.id,
			name: r.name,
			originRank: r.sourceRank,
			destRank: r.destRank,
			estimatedDuration: r.estimatedDuration ? `${r.estimatedDuration} min` : "N/A",
			estimatedFare: r.baseFare ? `R${Number(r.baseFare).toFixed(2)}` : "N/A",
			distance: r.distance ? `${r.distance} km` : "N/A",
			status: "active" // Default for now if status isn't on Route model, or check schema
		}));
	} else {
		// Fallback to mock
		routesWithRanks = mockRoutes.map((route) => {
			const originRank = ranks.find((r) => r.id === route.rankId);
			const destRank = route.destinationRankId
				? ranks.find((r) => r.id === route.destinationRankId)
				: null;

			return {
				...route,
				sourceRank: originRank, // Make sure structure matches real data for consistent access
				destRank: destRank,
				originRank,
			};
		});
	}

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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleEdit = (route: any) => {
		// Need to find the typed route object
		// Logic: passed route is formatted for table, we need original shape mostly for lat/lng
		// However, we mapped originRank/destRank which have the coords.
		const original = dataToUse?.find(r => r.id === route.id);

		if (original) {
			setSelectedRoute(original);
			onOpen();
		} else if (!dataToUse && route.originRank && route.destRank) {
			// Handle mock data case if needed, or just warn
			// Convert route to RouteWithRanks shape loosely for the modal
			setSelectedRoute({
				...route,
				sourceRank: route.originRank,
				destRank: route.destRank
			} as RouteWithRanks);
			onOpen();
		}
	};

	const handleSaveRoute = async () => {
		if (!selectedRoute || !routeUpdates) return;

		setIsSaving(true);
		try {
			await updateRoute({
				id: selectedRoute.id,
				data: {
					polyline: routeUpdates.polyline,
					distance: routeUpdates.distance, // Ensure backend handles number vs string if needed
					estimatedDuration: routeUpdates.duration // Ensure backend handles math
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} as any // relaxing type for partial update structure
			});

			addToast({
				title: "Route Updated",
				description: "Route path has been successfully updated.",
				color: "success",
			});
			onOpenChange(); // Close modal
		} catch (error) {
			console.error("Failed to update route", error);
			addToast({
				title: "Error",
				description: "Failed to update route.",
				color: "danger",
			});
		} finally {
			setIsSaving(false);
		}
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
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="4xl"
				scrollBehavior="inside"
			>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">
								Edit Route: {selectedRoute?.name}
							</ModalHeader>
							<ModalBody>
								<p className="text-sm text-default-500 mb-4">
									Drag the route line on the map to modify the path. The new distance and duration will be calculated automatically.
								</p>

								{selectedRoute && selectedRoute.sourceRank && selectedRoute.destRank ? (
									<RouteBuilderMap
										apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
										origin={{
											lat: selectedRoute.sourceRank.lat,
											lng: selectedRoute.sourceRank.lng
										}}
										destination={{
											lat: selectedRoute.destRank.lat,
											lng: selectedRoute.destRank.lng
										}}
										onRouteChanged={handleRouteChanged}
										className="w-full h-[500px] border border-default-200 rounded-xl"
									/>
								) : (
									<div className="h-[300px] flex items-center justify-center bg-content2 rounded-lg">
										Loading Map Data...
									</div>
								)}

								{routeUpdates && (
									<div className="mt-4 grid grid-cols-3 gap-4">
										<div className="p-3 bg-content2 rounded-lg">
											<p className="text-xs text-default-500">New Distance</p>
											<p className="text-lg font-semibold">{routeUpdates.distance} km</p>
										</div>
										<div className="p-3 bg-content2 rounded-lg">
											<p className="text-xs text-default-500">New Duration</p>
											<p className="text-lg font-semibold">{routeUpdates.duration} min</p>
										</div>
										<div className="p-3 bg-content2 rounded-lg">
											<p className="text-xs text-default-500">Route Summary</p>
											<p className="text-lg font-semibold truncate">{routeUpdates.summary}</p>
										</div>
									</div>
								)}
							</ModalBody>
							<ModalFooter>
								<Button color="danger" variant="light" onPress={onClose}>
									Cancel
								</Button>
								<Button
									color="primary"
									onPress={handleSaveRoute}
									isLoading={isSaving}
									isDisabled={!routeUpdates}
								>
									Save Changes
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

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
													onPress={() => handleEdit(route)}>
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
