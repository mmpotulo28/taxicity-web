"use client";

import React, { useState, useMemo } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Icon } from "@iconify/react";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import { useDriver, Trip } from "@/context/DriverContext";
import { MapView } from "@/components/map-view";

export function DriverConsole() {
	const {
		driver,
		activeVehicleTrip,
		incomingRequests,
		startShift,
		endShift,
		acceptRequest,
		updatePassengerStatus,
	} = useDriver();

	const [selectedTaxi, setSelectedTaxi] = useState("");
	const [selectedRoute, setSelectedRoute] = useState("");
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	// Calculate sorted passengers and map stops
	const { sortedPassengers, mapStops, routePoints } = useMemo(() => {
		if (!activeVehicleTrip) return { sortedPassengers: [], mapStops: [], routePoints: [] };

		const points = activeVehicleTrip.route.popularLocations || [];
		const stops: { lat: number; lng: number; type: 'pickup' | 'dropoff'; label: string; sortIndex: number }[] = [];

		// Sort passengers by next stop
		const sorted = [...activeVehicleTrip.passengers].sort((a, b) => {
			const getNextStopIndex = (p: Trip) => {
				// If completed, push to bottom
				if (p.status === 'COMPLETED') return Infinity;

				const targetLat = p.status === 'IN_PROGRESS' ? p.dropoffLat : p.pickupLat;
				const targetLng = p.status === 'IN_PROGRESS' ? p.dropoffLng : p.pickupLng;

				let minIdx = 0;
				let minDist = Infinity;
				points.forEach((pt, idx) => {
					const d = Math.hypot(pt.lat - targetLat, pt.lng - targetLng);
					if (d < minDist) { minDist = d; minIdx = idx; }
				});
				return minIdx;
			};

			return getNextStopIndex(a) - getNextStopIndex(b);
		});

		// Generate map markers for stops
		activeVehicleTrip.passengers.forEach(p => {
			if (p.status === 'ACCEPTED' || p.status === 'ARRIVED_AT_PICKUP') {
				stops.push({
					lat: p.pickupLat,
					lng: p.pickupLng,
					type: 'pickup',
					label: `Pickup: ${p.user?.firstName}`,
					sortIndex: -1 // Not used for sorting here
				});
			}
			if (['ACCEPTED', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS'].includes(p.status)) {
				stops.push({
					lat: p.dropoffLat,
					lng: p.dropoffLng,
					type: 'dropoff',
					label: `Dropoff: ${p.user?.firstName}`,
					sortIndex: -1
				});
			}
		});

		return { sortedPassengers: sorted, mapStops: stops, routePoints: points };
	}, [activeVehicleTrip]);

	if (!driver) return null;

	// 1. Shift Start Screen
	if (!activeVehicleTrip) {
		const availableTaxis = driver.taxis || [];
		const taxi = availableTaxis.find((t) => t.id === selectedTaxi);
		const availableRoutes = taxi?.routes?.map((r) => r.route) || [];

		return (
			<div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-default-50 p-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="w-full max-w-md">
					<Card className="w-full shadow-medium">
						<CardHeader className="flex flex-col gap-2 items-center pt-8 pb-4">
							<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-primary">
								<Icon icon="lucide:car-taxi-front" width={32} />
							</div>
							<h2 className="text-2xl font-bold">Start Your Shift</h2>
							<p className="text-default-500 text-center">
								Select your vehicle and route to begin receiving passengers.
							</p>
						</CardHeader>
						<CardBody className="space-y-6 p-6 pt-2">
							<Select
								label="Select Vehicle"
								placeholder="Choose a taxi"
								selectedKeys={selectedTaxi ? [selectedTaxi] : []}
								onChange={(e) => setSelectedTaxi(e.target.value)}
								variant="bordered"
								startContent={<Icon icon="lucide:car" className="text-default-400" />}>
								{availableTaxis.map((taxi) => (
									<SelectItem key={taxi.id} textValue={`${taxi.licensePlate} - ${taxi.model}`}>
										<div className="flex flex-col">
											<span className="font-medium">{taxi.licensePlate}</span>
											<span className="text-tiny text-default-400">{taxi.model}</span>
										</div>
									</SelectItem>
								))}
							</Select>

							<Select
								label="Select Route"
								placeholder="Choose a route"
								selectedKeys={selectedRoute ? [selectedRoute] : []}
								onChange={(e) => setSelectedRoute(e.target.value)}
								isDisabled={!selectedTaxi}
								variant="bordered"
								startContent={<Icon icon="lucide:map" className="text-default-400" />}>
								{availableRoutes.map((route) => (
									<SelectItem key={route.id}>{route.name}</SelectItem>
								))}
							</Select>

							<Button
								color="primary"
								size="lg"
								className="w-full font-semibold shadow-lg shadow-primary/20"
								isDisabled={!selectedTaxi || !selectedRoute}
								onPress={() => startShift(selectedTaxi, selectedRoute)}
								endContent={<Icon icon="lucide:arrow-right" />}>
								Start Shift
							</Button>
						</CardBody>
					</Card>
				</motion.div>
			</div>
		);
	}

	// 2. Active Shift Screen
	return (
		<div className="relative h-[calc(100vh-64px)] w-full overflow-hidden flex flex-col lg:flex-row">
			{/* Map Layer */}
			<div className="absolute inset-0 lg:relative lg:flex-grow lg:h-full z-0">
				<MapView
					showRoute={true}
					customRoutePoints={routePoints}
					passengerStops={mapStops}
					isDriver={true}
				/>
			</div>

			{/* Overlay / Sidebar Panel */}
			<div className="absolute bottom-0 left-0 right-0 lg:relative lg:w-96 lg:h-full bg-background/95 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-default-200 z-10 flex flex-col max-h-[60vh] lg:max-h-full shadow-2xl transition-all">
				{/* Header */}
				<div className="p-4 border-b border-default-100 bg-background/50 sticky top-0 z-20">
					<div className="flex justify-between items-start mb-2 flex-wrap gap-2">
						<div>
							<p className="text-xs font-bold text-primary uppercase tracking-wider">
								Current Route
							</p>
							<h3 className="font-bold text-lg truncate pr-2">
								{activeVehicleTrip.route.name}
							</h3>
						</div>
					</div>
					<div className="flex gap-4 text-sm text-default-500 mt-4">
						<div className="flex items-center gap-1">
							<Icon icon="lucide:users" />
							<span>
								{activeVehicleTrip.passengers.length} / {activeVehicleTrip.capacity}
							</span>
						</div>
						<div className="flex items-center gap-1">
							<Icon icon="lucide:clock" />
							<span>On Time</span>
						</div>
						<div className="flex gap-2 justify-end ml-auto">
							<Button
								color="primary"
								size="sm"
								onPress={onOpen}
								startContent={<Icon icon="lucide:qr-code" />}>
								QR Code
							</Button>
							<Button
								color="danger"
								variant="bordered"
								size="sm"
								onPress={endShift}
								startContent={<Icon icon="lucide:power" />}>
								End Shift
							</Button>
						</div>
					</div>
				</div>

				{/* Scrollable Content */}
				<div className="overflow-y-auto flex-1 p-4 space-y-6">
					{/* Incoming Requests */}
					<AnimatePresence>
						{incomingRequests.length > 0 && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="space-y-3">
								<div className="flex items-center justify-between">
									<h3 className="font-semibold text-sm text-default-600 flex items-center gap-2">
										<span className="relative flex h-2 w-2">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
											<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
										</span>
										Incoming Requests
									</h3>
									<Chip size="sm" color="primary" variant="flat">
										{incomingRequests.length}
									</Chip>
								</div>

								{incomingRequests.map((req) => (
									<motion.div
										key={req.id}
										initial={{ x: -20, opacity: 0 }}
										animate={{ x: 0, opacity: 1 }}
										exit={{ x: 20, opacity: 0 }}>
										<Card className="border-l-4 border-l-primary shadow-sm">
											<CardBody className="gap-3 p-3">
												<div className="flex justify-between items-start">
													<div>
														<span className="font-semibold text-sm">New Passenger</span>
														<div className="flex items-center gap-1 text-xs text-default-400 mt-0.5">
															<Icon icon="lucide:clock" width={12} />
															<span>2 mins away</span>
														</div>
													</div>
													<Chip size="sm" color="success" variant="flat" className="font-bold">
														R{req.fare}
													</Chip>
												</div>

												<div className="space-y-2 my-1">
													<div className="flex gap-2 items-start">
														<div className="mt-1 min-w-[16px]">
															<div className="w-2 h-2 rounded-full bg-success ring-2 ring-success/30" />
														</div>
														<span className="text-xs text-default-600 line-clamp-1">
															{req.pickupAddress}
														</span>
													</div>
													<div className="flex gap-2 items-start">
														<div className="mt-1 min-w-[16px]">
															<div className="w-2 h-2 rounded-full bg-danger ring-2 ring-danger/30" />
														</div>
														<span className="text-xs text-default-600 line-clamp-1">
															{req.dropoffAddress}
														</span>
													</div>
												</div>

												<Button
													size="sm"
													color="primary"
													className="w-full font-medium"
													onPress={() => acceptRequest(req.id)}>
													Accept Passenger
												</Button>
											</CardBody>
										</Card>
									</motion.div>
								))}
							</motion.div>
						)}
					</AnimatePresence>

					{/* Passenger Manifest */}
					<div className="space-y-3">
						<h3 className="font-semibold text-sm text-default-600">Passenger Manifest</h3>
						{sortedPassengers.length === 0 ? (
							<div className="text-center py-8 border-2 border-dashed border-default-200 rounded-lg">
								<Icon
									icon="lucide:users"
									className="w-8 h-8 mx-auto text-default-300 mb-2"
								/>
								<p className="text-sm text-default-400">Vehicle is empty</p>
							</div>
						) : (
							<div className="space-y-2">
								{sortedPassengers.map((p) => (
									<PassengerCard
										key={p.id}
										passenger={p}
										onUpdateStatus={updatePassengerStatus}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			<Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur">
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">Scan to Board</ModalHeader>
							<ModalBody className="items-center py-8">
								<div className="p-4 bg-white rounded-xl shadow-lg">
									<QRCode
										value={JSON.stringify({
											type: "BOARDING",
											vehicleTripId: activeVehicleTrip.id,
											taxiId: activeVehicleTrip.taxi.id,
										})}
										size={200}
									/>
								</div>
								<p className="text-center text-default-500 mt-4">
									Ask passengers to scan this code to confirm boarding.
								</p>
							</ModalBody>
							<ModalFooter>
								<Button color="primary" onPress={onClose}>
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

function PassengerCard({
	passenger,
	onUpdateStatus,
}: {
	passenger: Trip;
	onUpdateStatus: (id: string, status: string) => void;
}) {
	const getStatusColor = (status: string): "warning" | "primary" | "success" | "default" => {
		switch (status) {
			case "ACCEPTED":
				return "warning";
			case "ARRIVED_AT_PICKUP":
				return "primary";
			case "IN_PROGRESS":
				return "success";
			default:
				return "default";
		}
	};

	const getAction = () => {
		if (passenger.status === "ACCEPTED") {
			return {
				label: "Arrived",
				color: "primary" as const,
				action: () => onUpdateStatus(passenger.id, "ARRIVED_AT_PICKUP"),
				icon: "lucide:map-pin",
			};
		}
		if (passenger.status === "ARRIVED_AT_PICKUP") {
			// Boarding is handled via QR code scan by passenger
			return null;
		}
		if (passenger.status === "IN_PROGRESS") {
			return {
				label: "Drop Off",
				color: "default" as const,
				action: () => onUpdateStatus(passenger.id, "COMPLETED"),
				icon: "lucide:log-out",
			};
		}
		return null;
	};

	const action = getAction();

	return (
		<Card className="shadow-sm hover:shadow-md transition-shadow">
			<CardBody className="p-3">
				<div className="flex items-center justify-between gap-3">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<p className="font-semibold text-sm truncate">
								{passenger.user?.firstName || "Passenger"}
							</p>
							<Chip
								size="sm"
								color={getStatusColor(passenger.status)}
								variant="dot"
								className="h-5 text-[10px] px-1">
								{passenger.status.replace(/_/g, " ")}
							</Chip>
						</div>
						<div className="flex items-center gap-1 text-xs text-default-500">
							<Icon icon="lucide:map-pin" width={10} />
							<span className="truncate">{passenger.dropoffAddress}</span>
						</div>
					</div>

					{action && (
						<Button
							size="sm"
							color={action.color}
							variant={action.color === "default" ? "bordered" : "solid"}
							onPress={action.action}
							isIconOnly
							className="min-w-[32px] w-8 h-8">
							<Icon icon={action.icon} width={16} />
						</Button>
					)}
				</div>
			</CardBody>
		</Card>
	);
}
