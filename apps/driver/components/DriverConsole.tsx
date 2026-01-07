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
import { addToast } from "@heroui/toast";
import { useDriver, Trip } from "../context/DriverContext";
import { MapView } from "@taxicity/ui";
import { formatCurrency } from "@taxicity/utils";
import { RankQueue } from "./RankQueue";

export function DriverConsole() {
	const {
		driver,
		activeVehicleTrip,
		incomingRequests,
		startShift,
		endShift,
		acceptRequest,
		updatePassengerStatus,
		updateManualPassengers,
		currentLocation,
	} = useDriver();

	const [selectedTaxi, setSelectedTaxi] = useState("");
	const [selectedRoute, setSelectedRoute] = useState("");
	const [mode, setMode] = useState<"roaming" | "rank">("roaming");
	const [isInQueue, setIsInQueue] = useState(false);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const endShiftDisclosure = useDisclosure();
	const hasNotifiedRef = React.useRef<string | null>(null);

	// Automatically switch to Rank mode if in queue
	const handleQueueStatusChange = (inQueue: boolean) => {
		setIsInQueue(inQueue);
		if (inQueue) setMode("rank");
	};

	// Summary State for End of Shift
	interface TripStats {
		route: string;
		totalPassengers: number;
		appPassengers: number;
		manualPassengers: number;
		totalRevenue: number;
		digitalRevenue: number;
		cashDue: number;
	}
	const [lastTripStats, setLastTripStats] = useState<TripStats | null>(null);

	// Manual Boarding State from Context
	const manualPassengers = activeVehicleTrip?.manualPassengers || 0;

	// Calculate total passengers including walk-ins
	const totalPassengers = (activeVehicleTrip?.passengers.length || 0) + manualPassengers;
	const remainingCapacity = (activeVehicleTrip?.capacity || 15) - totalPassengers;

	const handleManualAdd = async () => {
		if (remainingCapacity > 0) {
			await updateManualPassengers(manualPassengers + 1);
		} else {
			addToast({
				title: "Capacity Full",
				description: "Cannot add more passengers.",
				color: "danger",
			});
		}
	};

	const handleManualRemove = async () => {
		if (manualPassengers > 0) {
			await updateManualPassengers(manualPassengers - 1);
		}
	};

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

	// Geofencing / Proximity Alert
	React.useEffect(() => {
		if (!currentLocation || sortedPassengers.length === 0) return;

		const nextPassenger = sortedPassengers[0];
		const isPickup = nextPassenger.status !== 'IN_PROGRESS';
		const targetLat = isPickup ? nextPassenger.pickupLat : nextPassenger.dropoffLat;
		const targetLng = isPickup ? nextPassenger.pickupLng : nextPassenger.dropoffLng;
		const stopId = `${nextPassenger.id}-${isPickup ? 'pickup' : 'dropoff'}`;

		// Approx distance in meters (1 deg lat ~ 111km)
		const dist = Math.hypot(currentLocation.lat - targetLat, currentLocation.lng - targetLng) * 111000;

		if (dist < 150 && hasNotifiedRef.current !== stopId) {
			addToast({
				title: "Arriving at Stop",
				description: `You are near ${nextPassenger.user?.firstName}'s ${isPickup ? 'pickup' : 'dropoff'}.`,
				color: "primary",
			});
			hasNotifiedRef.current = stopId;
		}
	}, [currentLocation, sortedPassengers]);

	if (!driver) return null;

	// 0. Shift Summary Screen (Post-Shift)
	if (!activeVehicleTrip && lastTripStats) {
		return (
			<div className="h-[calc(100vh-64px)] w-full flex items-center justify-center p-4 bg-default-50">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="w-full max-w-md">
					<Card className="shadow-2xl border-t-8 border-t-success">
						<CardHeader className="flex flex-col gap-2 items-center text-center pb-2 pt-8">
							<div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-2 text-success ring-8 ring-success/5">
								<Icon icon="solar:check-circle-bold-duotone" width={48} />
							</div>
							<h2 className="text-2xl font-bold text-default-900">Shift Completed</h2>
							<p className="text-default-500">
								Here is your cash-up summary for the route.
							</p>
						</CardHeader>
						<CardBody className="space-y-6 p-6">
							<div className="bg-default-50 p-5 rounded-2xl border border-default-200/60 space-y-4">
								<div className="text-center pb-4 border-b border-dashed border-default-200">
									<p className="text-xs uppercase tracking-wider font-bold text-default-400 mb-1">Route</p>
									<p className="font-bold text-lg text-default-800">{lastTripStats.route}</p>
								</div>

								<div className="space-y-3">
									<div className="flex justify-between items-center text-sm">
										<span className="text-default-500">Total Passengers</span>
										<span className="font-semibold">{lastTripStats.totalPassengers}</span>
									</div>
									<div className="flex justify-between items-center text-sm">
										<span className="text-default-500">Trips (App)</span>
										<span className="font-semibold">{lastTripStats.appPassengers}</span>
									</div>
									<div className="flex justify-between items-center text-sm">
										<span className="text-default-500">Trips (Walk-In)</span>
										<span className="font-semibold">{lastTripStats.manualPassengers}</span>
									</div>
								</div>

								<div className="h-px bg-default-200 my-2" />

								<div className="space-y-1">
									<div className="flex justify-between items-center text-sm">
										<span className="text-default-600">Total Revenue</span>
										<span className="font-bold">{formatCurrency(lastTripStats.totalRevenue)}</span>
									</div>
									<div className="flex justify-between items-center text-sm text-danger/80">
										<span>Less: Paid Online</span>
										<span>- {formatCurrency(lastTripStats.digitalRevenue)}</span>
									</div>
									<div className="flex justify-between items-center text-xl font-black text-success pt-3 pb-1">
										<span>CASH DUE</span>
										<span>{formatCurrency(lastTripStats.cashDue)}</span>
									</div>
								</div>
							</div>

							<div className="bg-warning/10 text-warning-700 p-3 rounded-lg text-xs flex gap-2 items-start">
								<Icon icon="solar:info-circle-bold" width={16} className="mt-0.5 min-w-[16px]" />
								<p>Please hand over the exact cash amount to the marshal or owner before starting your next shift.</p>
							</div>

							<Button
								color="primary"
								size="lg"
								className="w-full font-bold shadow-lg shadow-primary/20"
								onPress={() => setLastTripStats(null)} // Clear stats to go back to start
								endContent={<Icon icon="lucide:arrow-right" />}>
								Start New Shift
							</Button>
						</CardBody>
					</Card>
				</motion.div>
			</div>
		);
	}

	// 1. Shift Start Screen
	if (!activeVehicleTrip) {
		const availableTaxis = driver.taxis || [];
		const taxi = availableTaxis.find((t) => t.id === selectedTaxi);
		const availableRoutes = taxi?.routes?.map((r) => r.route) || [];

		// Mode State (Lifted to top-level)

		return (
			<div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-default-50 p-4 gap-6">

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="w-full max-w-md space-y-4">

					{/* Vehicle Selection is always first */}
					<Card className="w-full shadow-sm">
						<CardBody className="p-4">
							<Select
								label="Select Vehicle"
								placeholder="Choose a taxi"
								selectedKeys={selectedTaxi ? [selectedTaxi] : []}
								onChange={(e) => setSelectedTaxi(e.target.value)}
								variant="bordered"
								size="sm"
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
						</CardBody>
					</Card>

					{/* Mode Switcher */}
					{selectedTaxi && !isInQueue && (
						<div className="flex p-1 bg-default-200/50 rounded-lg">
							<button
								onClick={() => setMode("roaming")}
								className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${mode === "roaming" ? "bg-white shadow-sm text-primary" : "text-default-500 hover:text-default-700"
									}`}>
								<Icon icon="lucide:map" width={16} />
								Roaming
							</button>
							<button
								onClick={() => setMode("rank")}
								className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${mode === "rank" ? "bg-white shadow-sm text-primary" : "text-default-500 hover:text-default-700"
									}`}>
								<Icon icon="solar:users-group-rounded-bold" width={16} />
								Rank Queue
							</button>
						</div>
					)}

					{/* Roaming Mode: Select Route & Start */}
					{mode === "roaming" && selectedTaxi && !isInQueue && (
						<Card className="w-full shadow-medium">
							<CardHeader className="flex flex-col gap-2 items-center pt-6 pb-2">
								<h2 className="text-xl font-bold">Start Roaming Shift</h2>
								<p className="text-default-500 text-center text-sm px-4">
									Select a route to begin picking up passengers along the way.
								</p>
							</CardHeader>
							<CardBody className="space-y-4 p-6 pt-2">
								<Select
									label="Select Route"
									placeholder="Choose a route"
									selectedKeys={selectedRoute ? [selectedRoute] : []}
									onChange={(e) => setSelectedRoute(e.target.value)}
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
									isDisabled={!selectedRoute}
									onPress={() => startShift(selectedTaxi, selectedRoute)}
									endContent={<Icon icon="lucide:arrow-right" />}>
									Go Online
								</Button>
							</CardBody>
						</Card>
					)}

					{/* Rank Mode: Queue Interface */}
					{(mode === "rank" || isInQueue) && selectedTaxi && (
						<div className="w-full">
							<RankQueue
								taxiId={selectedTaxi}
								currentLocation={currentLocation || null} // Pass current location for sorting
								onStatusChange={handleQueueStatusChange}
								onStartTrip={(routeId) => startShift(selectedTaxi, routeId)}
							/>
						</div>
					)}

					{/* Welcome / Empty State */}
					{!selectedTaxi && (
						<div className="text-center py-8 text-default-400">
							<Icon icon="lucide:arrow-up" className="mx-auto mb-2 animate-bounce" width={24} />
							<p>Please select a vehicle to continue</p>
						</div>
					)}

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
					taxiLocation={currentLocation || undefined}
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
						<Button
							color="danger"
							variant="shadow"
							size="sm"
							className="font-bold min-w-0 px-3"
							onPress={() => {
								if (window.confirm("Are you sure you want to trigger the Panic Button? This will alert support and track your location.")) {
									addToast({
										title: "Emergency Alert Sent",
										description: "Support has been notified with your live location.",
										color: "danger",
									});
								}
							}}
							startContent={<Icon icon="lucide:siren" width={16} />}
						>
							SOS
						</Button>
					</div>

					{/* Passenger Status & Manual Controls */}
					<div className="mt-4 p-3 bg-default-50 rounded-xl border border-default-200">
						<div className="flex justify-between items-center mb-3">
							<div className="flex flex-col">
								<span className="text-xs font-semibold text-default-500 uppercase">Occupancy</span>
								<div className="flex items-baseline gap-1">
									<span className={`text-xl font-bold ${remainingCapacity === 0 ? 'text-danger' : 'text-default-900'}`}>
										{totalPassengers}
									</span>
									<span className="text-sm text-default-400">/ {activeVehicleTrip.capacity}</span>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<div className="flex flex-col items-end">
									<span className="text-[10px] font-bold text-default-400 uppercase tracking-wider mb-1">
										Walk-Ins
									</span>
									<div className="flex items-center gap-1 bg-white rounded-lg border border-default-200 p-1 shadow-sm">
										<Button
											isIconOnly
											size="sm"
											variant="light"
											onPress={handleManualRemove}
											isDisabled={manualPassengers === 0}
											className="w-6 h-6 min-w-6 text-default-500"
										>
											<Icon icon="lucide:minus" width={14} />
										</Button>
										<span className="w-6 text-center font-bold text-default-700 text-sm">
											{manualPassengers}
										</span>
										<Button
											isIconOnly
											size="sm"
											variant="light"
											onPress={handleManualAdd}
											isDisabled={remainingCapacity === 0}
											className="w-6 h-6 min-w-6 text-primary"
										>
											<Icon icon="lucide:plus" width={14} />
										</Button>
									</div>
								</div>
							</div>
						</div>

						<div className="flex gap-2 justify-between items-center pt-2 border-t border-default-200/50">
							<div className="flex items-center gap-1 text-xs text-default-500">
								<Icon icon="lucide:smartphone" width={14} className="text-primary" />
								<span className="font-medium text-default-700">{activeVehicleTrip.passengers.length}</span>
								<span>App</span>
							</div>
							<div className="h-3 w-px bg-default-300"></div>
							<div className="flex items-center gap-1 text-xs text-default-500">
								<Icon icon="lucide:users" width={14} className="text-default-400" />
								<span>{manualPassengers} Walk-in</span>
							</div>
							<div className="flex gap-2 justify-end ml-auto">
								<Button
									color="primary"
									size="sm"
									onPress={onOpen}
									className="h-8 font-medium"
									startContent={<Icon icon="lucide:qr-code" width={16} />}>
									QR Code
								</Button>
								<Button
									color="danger"
									variant="flat"
									size="sm"
									onPress={endShiftDisclosure.onOpen}
									className="h-8 font-medium"
									isIconOnly>
									<Icon icon="lucide:power" width={16} />
								</Button>
							</div>
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

			<Modal isOpen={endShiftDisclosure.isOpen} onOpenChange={endShiftDisclosure.onOpenChange} backdrop="blur">
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">Cash Up & End Shift</ModalHeader>
							<ModalBody className="py-4">
								<div className="bg-default-50 p-4 rounded-xl border border-default-100 space-y-3">
									<div className="flex justify-between items-center text-sm font-semibold text-default-600 border-b border-default-200 pb-2">
										<span>Route: {activeVehicleTrip.route.name}</span>
									</div>

									<div className="space-y-2">
										<p className="text-xs font-bold text-default-500 uppercase">Passenger Breakdown</p>
										<div className="flex justify-between items-center text-sm">
											<span className="text-default-500">App (Cash)</span>
											<span className="font-semibold">
												{activeVehicleTrip.passengers.filter(p => p.paymentMethod === 'CASH').length}
												<span className="text-default-400 mx-1">x</span>
												{formatCurrency(activeVehicleTrip.route.baseFare)}
											</span>
										</div>
										<div className="flex justify-between items-center text-sm">
											<span className="text-default-500">App (Digital)</span>
											<span className="font-semibold">
												{activeVehicleTrip.passengers.filter(p => p.paymentMethod !== 'CASH').length}
												<span className="text-default-400 mx-1">x</span>
												{formatCurrency(activeVehicleTrip.route.baseFare)}
											</span>
										</div>
										<div className="flex justify-between items-center text-sm">
											<span className="text-default-500">Walk-Ins (Cash)</span>
											<span className="font-semibold">
												{manualPassengers}
												<span className="text-default-400 mx-1">x</span>
												{formatCurrency(activeVehicleTrip.route.baseFare)}
											</span>
										</div>
									</div>

									<div className="h-px bg-default-200 my-2" />

									<div className="bg-white p-3 rounded-lg border border-default-200 space-y-1">
										<div className="flex justify-between items-center text-sm">
											<span className="text-default-600">Total Revenue</span>
											<span className="font-bold">
												{formatCurrency(
													(activeVehicleTrip.passengers.length + manualPassengers) * activeVehicleTrip.route.baseFare
												)}
											</span>
										</div>
										<div className="flex justify-between items-center text-sm text-danger">
											<span>Less: Digital Payments</span>
											<span>
												- {formatCurrency(
													activeVehicleTrip.passengers
														.filter(p => p.paymentMethod !== 'CASH')
														.reduce((acc) => acc + Number(activeVehicleTrip.route.baseFare), 0)
												)}
											</span>
										</div>
										<div className="flex justify-between items-center text-lg font-black text-success pt-2 border-t border-dashed border-default-200 mt-2">
											<span>CASH DUE</span>
											<span>
												{formatCurrency(
													(activeVehicleTrip.passengers.filter(p => p.paymentMethod === 'CASH').length * activeVehicleTrip.route.baseFare) +
													(manualPassengers * activeVehicleTrip.route.baseFare)
												)}
											</span>
										</div>
									</div>
								</div>
								<p className="text-center text-xs text-default-500 mt-2">
									Ensure you have this cash amount ready for the owner/marshal before ending.
								</p>
							</ModalBody>
							<ModalFooter>
								<Button variant="flat" onPress={onClose}>
									Cancel
								</Button>
								<Button
									color="danger"
									onPress={async () => {
										// Capture Trip Stats before Ending
										const stats = {
											route: activeVehicleTrip.route.name,
											totalPassengers: activeVehicleTrip.passengers.length + manualPassengers,
											appPassengers: activeVehicleTrip.passengers.length,
											manualPassengers: manualPassengers,
											baseFare: activeVehicleTrip.route.baseFare,
											totalRevenue: (activeVehicleTrip.passengers.length + manualPassengers) * activeVehicleTrip.route.baseFare,
											digitalRevenue: activeVehicleTrip.passengers
												.filter(p => p.paymentMethod !== 'CASH')
												.reduce((acc) => acc + Number(activeVehicleTrip.route.baseFare), 0),
											cashDue: (activeVehicleTrip.passengers.filter(p => p.paymentMethod === 'CASH').length * activeVehicleTrip.route.baseFare) +
												(manualPassengers * activeVehicleTrip.route.baseFare)
										};

										await endShift(); // This will set activeVehicleTrip to null
										setLastTripStats(stats); // This triggers the Summary Screen
										onClose();
									}}
								>
									End Shift
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
			// Allow manual boarding override
			return {
				label: "Board",
				color: "primary" as const,
				action: () => onUpdateStatus(passenger.id, "IN_PROGRESS"),
				icon: "lucide:log-in",
			};
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
