import React, { useState, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { Card } from "heroui-native/card";
import { Button } from "heroui-native/button";
import { Select } from "heroui-native/select";
import { Chip } from "heroui-native/chip";
import { Feather } from "@expo/vector-icons";
import QRCode from "react-qr-code";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useDriver, Trip } from "../context/DriverContext";
import { MapView } from "@taxiciti/ui";
import { formatCurrency } from "@taxiciti/utils";
import { RankQueue } from "./RankQueue";
import { RequestModal } from "./RequestModal";
import { BottomSheet } from "heroui-native/bottom-sheet";

export function DriverConsole() {
	const { driver, activeVehicleTrip, incomingRequests, startShift, endShift, acceptRequest, declineRequest, updatePassengerStatus, updateManualPassengers, currentLocation } = useDriver();

	const [selectedTaxi, setSelectedTaxi] = useState("");
	const [selectedRoute, setSelectedRoute] = useState("");
	const [mode, setMode] = useState<"roaming" | "rank">("roaming");
	const [isInQueue, setIsInQueue] = useState(false);
	const [statusUpdateTripId, setStatusUpdateTripId] = useState<string | null>(null);
	const [isOpen, onOpenChange] = useState(false);
	const onOpen = () => onOpenChange(true);
	const [isEndShiftOpen, setEndShiftOpen] = useState(false);
	const endShiftDisclosure = { isOpen: isEndShiftOpen, onOpen: () => setEndShiftOpen(true), onOpenChange: setEndShiftOpen };
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
			console.log("Toast omitted");
		}
	};

	const handleManualRemove = async () => {
		if (manualPassengers > 0) {
			await updateManualPassengers(manualPassengers - 1);
		}
	};

	const handlePassengerStatusUpdate = async (tripId: string, status: string) => {
		setStatusUpdateTripId(tripId);
		try {
			await updatePassengerStatus(tripId, status);
		} finally {
			setStatusUpdateTripId(null);
		}
	};

	// Calculate sorted passengers and map stops
	const { sortedPassengers, mapStops, routePoints } = useMemo(() => {
		if (!activeVehicleTrip) return { sortedPassengers: [], mapStops: [], routePoints: [] };

		const points = activeVehicleTrip.route.popularLocations || [];
		const stops: { lat: number; lng: number; type: "pickup" | "dropoff"; label: string; sortIndex: number }[] = [];

		// Sort passengers by next stop
		const sorted = [...activeVehicleTrip.passengers].sort((a, b) => {
			const getNextStopIndex = (p: Trip) => {
				// If completed, push to bottom
				if (p.status === "COMPLETED") return Infinity;

				const targetLat = p.status === "IN_PROGRESS" ? p.dropoffLat : p.pickupLat;
				const targetLng = p.status === "IN_PROGRESS" ? p.dropoffLng : p.pickupLng;

				let minIdx = 0;
				let minDist = Infinity;
				points.forEach((pt, idx) => {
					const d = Math.hypot(pt.lat - targetLat, pt.lng - targetLng);
					if (d < minDist) {
						minDist = d;
						minIdx = idx;
					}
				});
				return minIdx;
			};

			return getNextStopIndex(a) - getNextStopIndex(b);
		});

		// Generate map markers for stops
		activeVehicleTrip.passengers.forEach((p) => {
			if (p.status === "ACCEPTED" || p.status === "ARRIVED_AT_PICKUP") {
				stops.push({
					lat: p.pickupLat,
					lng: p.pickupLng,
					type: "pickup",
					label: `Pickup: ${p.user?.firstName}`,
					sortIndex: -1, // Not used for sorting here
				});
			}
			if (["ACCEPTED", "ARRIVED_AT_PICKUP", "IN_PROGRESS"].includes(p.status)) {
				stops.push({
					lat: p.dropoffLat,
					lng: p.dropoffLng,
					type: "dropoff",
					label: `Dropoff: ${p.user?.firstName}`,
					sortIndex: -1,
				});
			}
		});

		return { sortedPassengers: sorted, mapStops: stops, routePoints: points };
	}, [activeVehicleTrip]);

	// Geofencing / Proximity Alert
	React.useEffect(() => {
		if (!currentLocation || sortedPassengers.length === 0) return;

		const nextPassenger = sortedPassengers[0];
		const isPickup = nextPassenger.status !== "IN_PROGRESS";
		const targetLat = isPickup ? nextPassenger.pickupLat : nextPassenger.dropoffLat;
		const targetLng = isPickup ? nextPassenger.pickupLng : nextPassenger.dropoffLng;
		const stopId = `${nextPassenger.id}-${isPickup ? "pickup" : "dropoff"}`;

		// Approx distance in meters (1 deg lat ~ 111km)
		const dist = Math.hypot(currentLocation.lat - targetLat, currentLocation.lng - targetLng) * 111000;

		if (dist < 150 && hasNotifiedRef.current !== stopId) {
			console.log("Toast omitted");
			hasNotifiedRef.current = stopId;
		}
	}, [currentLocation, sortedPassengers]);

	if (!driver) return null;

	// 0. Shift Summary Screen (Post-Shift)
	if (!activeVehicleTrip && lastTripStats) {
		return (
			<View className='h-[calc(100vh-64px)] w-full flex items-center justify-center p-4 bg-default-50'>
				<Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} className='w-full max-w-md'>
					<Card className='shadow-2xl border-t-8 border-t-success'>
						<Card.Header className='flex flex-col gap-2 items-center text-center pb-2 pt-8'>
							<View className='w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-2 text-success ring-8 ring-success/5'>
								<Feather name='check-circle' width={48} />
							</View>
							<Text className='text-2xl font-bold text-default-900'>Shift Completed</Text>
							<Text className='text-default-500'>Here is your cash-up summary for the route.</Text>
						</Card.Header>
						<Card.Body className='space-y-6 p-6'>
							<View className='bg-default-50 p-5 rounded-2xl border border-default-200/60 space-y-4'>
								<View className='text-center pb-4 border-b border-dashed border-default-200'>
									<Text className='text-xs uppercase tracking-wider font-bold text-default-400 mb-1'>Route</Text>
									<Text className='font-bold text-lg text-default-800'>{lastTripStats.route}</Text>
								</View>

								<View className='space-y-3'>
									<View className='flex justify-between items-center text-sm'>
										<Text className='text-default-500'>Total Passengers</Text>
										<Text className='font-semibold'>{lastTripStats.totalPassengers}</Text>
									</View>
									<View className='flex justify-between items-center text-sm'>
										<Text className='text-default-500'>Trips (App)</Text>
										<Text className='font-semibold'>{lastTripStats.appPassengers}</Text>
									</View>
									<View className='flex justify-between items-center text-sm'>
										<Text className='text-default-500'>Trips (Walk-In)</Text>
										<Text className='font-semibold'>{lastTripStats.manualPassengers}</Text>
									</View>
								</View>

								<View className='h-px bg-default-200 my-2' />

								<View className='space-y-1'>
									<View className='flex justify-between items-center text-sm'>
										<Text className='text-default-600'>Total Revenue</Text>
										<Text className='font-bold'>{formatCurrency(lastTripStats.totalRevenue)}</Text>
									</View>
									<View className='flex justify-between items-center text-sm text-danger/80'>
										<Text>Less: Paid Online</Text>
										<Text>- {formatCurrency(lastTripStats.digitalRevenue)}</Text>
									</View>
									<View className='flex justify-between items-center text-xl font-black text-success pt-3 pb-1'>
										<Text>CASH DUE</Text>
										<Text>{formatCurrency(lastTripStats.cashDue)}</Text>
									</View>
								</View>
							</View>

							<View className='bg-warning/10 text-warning-700 p-3 rounded-lg text-xs flex gap-2 items-start'>
								<Feather name='info' width={16} className='mt-0.5 min-w-[16px]' />
								<Text>Please hand over the exact cash amount to the marshal or owner before starting your next shift.</Text>
							</View>

							<Button
								variant='primary'
								size='lg'
								className='w-full font-bold shadow-lg shadow-primary/20'
								onPress={() => setLastTripStats(null)} // Clear stats to go back to start
							>
								<Feather name='arrow-right' />
								Start New Shift
							</Button>
						</Card.Body>
					</Card>
				</Animated.View>
			</View>
		);
	}

	// 1. Shift Start Screen
	if (!activeVehicleTrip) {
		const availableTaxis = driver.taxis || [];
		const taxi = availableTaxis.find((t) => t.id === selectedTaxi);
		const availableRoutes = taxi?.routes?.map((r) => r.route) || [];

		// Mode State (Lifted to top-level)

		return (
			<View className='min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-default-50 p-4 gap-6'>
				<Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} className='w-full max-w-md space-y-4'>
					{/* Vehicle Selection is always first */}
					<Card className='w-full shadow-sm'>
						<Card.Body className='p-4'>
							<Select value={selectedTaxi ? { value: selectedTaxi, label: availableTaxis.find((t) => t.id === selectedTaxi)?.licensePlate || selectedTaxi } : undefined} onValueChange={(opt: any) => setSelectedTaxi(opt?.value || "")}>
								<Select.Trigger>
									<Select.Value placeholder='Choose a taxi' />
									<Select.TriggerIndicator />
								</Select.Trigger>
								<Select.Portal>
									<Select.Overlay />
									<Select.Content presentation='popover' width='trigger'>
										{availableTaxis.map((taxi) => (
											<Select.Item key={taxi.id} value={taxi.id} label={taxi.licensePlate} />
										))}
									</Select.Content>
								</Select.Portal>
							</Select>
						</Card.Body>
					</Card>

					{/* Mode Switcher */}
					{selectedTaxi && !isInQueue && (
						<View className='flex p-1 bg-default-200/50 rounded-lg'>
							<Button onPress={() => setMode("roaming")} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${mode === "roaming" ? "bg-white shadow-sm text-primary" : "text-default-500 hover:text-default-700"}`}>
								<Feather name='map' width={16} />
								Roaming
							</Button>
							<Button onPress={() => setMode("rank")} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${mode === "rank" ? "bg-white shadow-sm text-primary" : "text-default-500 hover:text-default-700"}`}>
								<Feather name='users' width={16} />
								Rank Queue
							</Button>
						</View>
					)}

					{/* Roaming Mode: Select Route & Start */}
					{mode === "roaming" && selectedTaxi && !isInQueue && (
						<Card className='w-full shadow-medium'>
							<Card.Header className='flex flex-col gap-2 items-center pt-6 pb-2'>
								<Text className='text-xl font-bold'>Start Roaming Shift</Text>
								<Text className='text-default-500 text-center text-sm px-4'>Select a route to begin picking up passengers along the way.</Text>
							</Card.Header>
							<Card.Body className='space-y-4 p-6 pt-2'>
								<Select value={selectedRoute ? { value: selectedRoute, label: availableRoutes.find((r) => r.id === selectedRoute)?.name || selectedRoute } : undefined} onValueChange={(opt: any) => setSelectedRoute(opt?.value || "")}>
									<Select.Trigger>
										<Select.Value placeholder='Choose a route' />
										<Select.TriggerIndicator />
									</Select.Trigger>
									<Select.Portal>
										<Select.Overlay />
										<Select.Content presentation='popover' width='trigger'>
											{availableRoutes.map((route) => (
												<Select.Item key={route.id} value={route.id} label={route.name} />
											))}
										</Select.Content>
									</Select.Portal>
								</Select>

								<Button variant='primary' size='lg' className='w-full font-semibold shadow-lg shadow-primary/20' isDisabled={!selectedRoute} onPress={() => startShift(selectedTaxi, selectedRoute)}>
									<Feather name='arrow-right' />
									Go Online
								</Button>
							</Card.Body>
						</Card>
					)}

					{/* Rank Mode: Queue Interface */}
					{(mode === "rank" || isInQueue) && selectedTaxi && (
						<View className='w-full'>
							<RankQueue
								taxiId={selectedTaxi}
								currentLocation={currentLocation || null} // Pass current location for sorting
								onStatusChange={handleQueueStatusChange}
								onStartTrip={(routeId) => startShift(selectedTaxi, routeId)}
							/>
						</View>
					)}

					{/* Welcome / Empty State */}
					{!selectedTaxi && (
						<View className='text-center py-8 text-default-400'>
							<Feather name='arrow-up' className='mx-auto mb-2 animate-bounce' width={24} />
							<Text>Please select a vehicle to continue</Text>
						</View>
					)}
				</Animated.View>
			</View>
		);
	}

	// 2. Active Shift Screen
	return (
		<View className='relative h-[calc(100vh-64px)] w-full overflow-hidden flex flex-col lg:flex-row'>
			{/* Map Layer */}
			<View className='absolute inset-0 lg:relative lg:flex-grow lg:h-full z-0'>
				<MapView showRoute={true} routePolyline={activeVehicleTrip.route.polyline || undefined} passengerStops={mapStops} isDriver={true} taxiLocation={currentLocation || undefined} />
			</View>

			{/* Overlay / Sidebar Panel */}
			<View className='absolute bottom-0 left-0 right-0 lg:relative lg:w-96 lg:h-full bg-background/95 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-default-200 z-10 flex flex-col max-h-[60vh] lg:max-h-full shadow-2xl transition-all'>
				{/* Header */}
				<View className='p-4 border-b border-default-100 bg-background/50 sticky top-0 z-20'>
					<View className='flex justify-between items-start mb-2 flex-wrap gap-2'>
						<View>
							<Text className='text-xs font-bold text-primary uppercase tracking-wider'>Current Route</Text>
							<Text className='font-bold text-lg truncate pr-2'>{activeVehicleTrip.route.name}</Text>
						</View>
						<Button
							variant='danger'
							size='sm'
							className='font-bold min-w-0 px-3'
							onPress={() => {
								if (window.confirm("Are you sure you want to trigger the Panic Button? This will alert support and track your location.")) {
									console.log("Toast omitted");
								}
							}}>
							<Feather name='alert-triangle' width={16} />
							SOS
						</Button>
					</View>

					{/* Passenger Status & Manual Controls */}
					<View className='mt-4 p-3 bg-default-50 rounded-xl border border-default-200'>
						<View className='flex justify-between items-center mb-3'>
							<View className='flex flex-col'>
								<Text className='text-xs font-semibold text-default-500 uppercase'>Occupancy</Text>
								<View className='flex items-baseline gap-1'>
									<Text className={`text-xl font-bold ${remainingCapacity === 0 ? "text-danger" : "text-default-900"}`}>{totalPassengers}</Text>
									<Text className='text-sm text-default-400'>/ {activeVehicleTrip.capacity}</Text>
								</View>
							</View>

							<View className='flex items-center gap-3'>
								<View className='flex flex-col items-end'>
									<Text className='text-[10px] font-bold text-default-400 uppercase tracking-wider mb-1'>Walk-Ins</Text>
									<View className='flex items-center gap-1 bg-white rounded-lg border border-default-200 p-1 shadow-sm'>
										<Button isIconOnly size='sm' variant='ghost' onPress={handleManualRemove} isDisabled={manualPassengers === 0} className='w-6 h-6 min-w-6 text-default-500'>
											<Feather name='minus' width={14} />
										</Button>
										<Text className='w-6 text-center font-bold text-default-700 text-sm'>{manualPassengers}</Text>
										<Button isIconOnly size='sm' variant='ghost' onPress={handleManualAdd} isDisabled={remainingCapacity === 0} className='w-6 h-6 min-w-6 text-primary'>
											<Feather name='plus' width={14} />
										</Button>
									</View>
								</View>
							</View>
						</View>

						<View className='flex gap-2 justify-between items-center pt-2 border-t border-default-200/50'>
							<View className='flex items-center gap-1 text-xs text-default-500'>
								<Feather name='smartphone' width={14} className='text-primary' />
								<Text className='font-medium text-default-700'>{activeVehicleTrip.passengers.length}</Text>
								<Text>App</Text>
							</View>
							<View className='h-3 w-px bg-default-300'></View>
							<View className='flex items-center gap-1 text-xs text-default-500'>
								<Feather name='users' width={14} className='text-default-400' />
								<Text>{manualPassengers} Walk-in</Text>
							</View>
							<View className='flex gap-2 justify-end ml-auto'>
								<Button variant='primary' size='sm' onPress={onOpen} className='h-8 font-medium'>
									<Feather name='code' width={16} />
									QR Code
								</Button>
								<Button variant='danger' size='sm' onPress={endShiftDisclosure.onOpen} className='h-8 font-medium' isIconOnly>
									<Feather name='power' width={16} />
								</Button>
							</View>
						</View>
					</View>
				</View>

				{/* Scrollable Content */}
				<View className='overflow-y-auto flex-1 p-4 space-y-6'>
					{/* Passenger Manifest */}
					<View className='space-y-3'>
						<Text className='font-semibold text-sm text-default-600'>Passenger Manifest</Text>
						{sortedPassengers.length === 0 ? (
							<View className='text-center py-8 border-2 border-dashed border-default-200 rounded-lg'>
								<Feather name='users' className='w-8 h-8 mx-auto text-default-300 mb-2' />
								<Text className='text-sm text-default-400'>Vehicle is empty</Text>
							</View>
						) : (
							<View className='space-y-2'>
								{sortedPassengers.map((p) => (
									<PassengerCard key={p.id} passenger={p} onUpdateStatus={handlePassengerStatusUpdate} isUpdating={statusUpdateTripId === p.id} />
								))}
							</View>
						)}
					</View>
				</View>
			</View>

			<BottomSheet isOpen={isOpen} onOpenChange={(open) => !open && onOpenChange(false)}>
				<BottomSheet.Portal>
					<BottomSheet.Overlay />
					<BottomSheet.Content className='pb-8 px-4' snapPoints={["60%", "80%"]}>
						<BottomSheet.Close />
						<BottomSheet.Title className='text-xl font-bold mb-4 ml-2'>Scan to Board</BottomSheet.Title>
						<BottomSheet.Description className='hidden' />
						<View className='items-center py-8'>
							<View className='p-4 bg-white rounded-xl shadow-lg'>
								<QRCode
									value={JSON.stringify({
										type: "BOARDING",
										vehicleTripId: activeVehicleTrip.id,
										taxiId: activeVehicleTrip.taxi.id,
									})}
									size={200}
								/>
							</View>
							<Text className='text-center text-default-500 mt-4'>Ask passengers to scan this code to confirm boarding.</Text>
						</View>
						<View className='mt-4'>
							<Button variant='primary' onPress={() => onOpenChange(false)}>
								Close
							</Button>
						</View>
					</BottomSheet.Content>
				</BottomSheet.Portal>
			</BottomSheet>

			<BottomSheet isOpen={endShiftDisclosure.isOpen} onOpenChange={(open) => !open && endShiftDisclosure.onOpenChange(false)}>
				<BottomSheet.Portal>
					<BottomSheet.Overlay />
					<BottomSheet.Content className='pb-8 px-4' snapPoints={["90%"]}>
						<BottomSheet.Close />
						<BottomSheet.Title className='text-xl font-bold mb-4 ml-2'>Cash Up & End Shift</BottomSheet.Title>
						<BottomSheet.Description className='hidden' />
						<ScrollView className='py-4'>
							<View className='bg-default-50 p-4 rounded-xl border border-default-100 space-y-3'>
								<View className='flex justify-between items-center text-sm font-semibold text-default-600 border-b border-default-200 pb-2'>
									<Text>Route: {activeVehicleTrip.route.name}</Text>
								</View>

								<View className='space-y-2'>
									<Text className='text-xs font-bold text-default-500 uppercase'>Passenger Breakdown</Text>
									<View className='flex justify-between items-center text-sm'>
										<Text className='text-default-500'>App (Cash)</Text>
										<Text className='font-semibold'>
											{activeVehicleTrip.passengers.filter((p) => p.paymentMethod === "CASH").length}
											<Text className='text-default-400 mx-1'>x</Text>
											{formatCurrency(activeVehicleTrip.route.baseFare)}
										</Text>
									</View>
									<View className='flex justify-between items-center text-sm'>
										<Text className='text-default-500'>App (Digital)</Text>
										<Text className='font-semibold'>
											{activeVehicleTrip.passengers.filter((p) => p.paymentMethod !== "CASH").length}
											<Text className='text-default-400 mx-1'>x</Text>
											{formatCurrency(activeVehicleTrip.route.baseFare)}
										</Text>
									</View>
									<View className='flex justify-between items-center text-sm'>
										<Text className='text-default-500'>Walk-Ins (Cash)</Text>
										<Text className='font-semibold'>
											{manualPassengers}
											<Text className='text-default-400 mx-1'>x</Text>
											{formatCurrency(activeVehicleTrip.route.baseFare)}
										</Text>
									</View>
								</View>

								<View className='h-px bg-default-200 my-2' />

								<View className='bg-white p-3 rounded-lg border border-default-200 space-y-1'>
									<View className='flex justify-between items-center text-sm'>
										<Text className='text-default-600'>Total Revenue</Text>
										<Text className='font-bold'>{formatCurrency((activeVehicleTrip.passengers.length + manualPassengers) * activeVehicleTrip.route.baseFare)}</Text>
									</View>
									<View className='flex justify-between items-center text-sm text-danger'>
										<Text>Less: Digital Payments</Text>
										<Text>- {formatCurrency(activeVehicleTrip.passengers.filter((p) => p.paymentMethod !== "CASH").reduce((acc) => acc + Number(activeVehicleTrip.route.baseFare), 0))}</Text>
									</View>
									<View className='flex justify-between items-center text-lg font-black text-success pt-2 border-t border-dashed border-default-200 mt-2'>
										<Text>CASH DUE</Text>
										<Text>{formatCurrency(activeVehicleTrip.passengers.filter((p) => p.paymentMethod === "CASH").length * activeVehicleTrip.route.baseFare + manualPassengers * activeVehicleTrip.route.baseFare)}</Text>
									</View>
								</View>
							</View>
							<Text className='text-center text-xs text-default-500 mt-2'>Ensure you have this cash amount ready for the owner/marshal before ending.</Text>
						</ScrollView>
						<View className='flex flex-row gap-3 mt-4'>
							<View className='flex-1'>
								<Button variant='secondary' className='w-full' onPress={() => endShiftDisclosure.onOpenChange(false)}>
									Cancel
								</Button>
							</View>
							<View className='flex-1'>
								<Button
									variant='danger'
									className='w-full'
									onPress={async () => {
										// Capture Trip Stats before Ending
										const stats = {
											route: activeVehicleTrip.route.name,
											totalPassengers: activeVehicleTrip.passengers.length + manualPassengers,
											appPassengers: activeVehicleTrip.passengers.length,
											manualPassengers: manualPassengers,
											baseFare: activeVehicleTrip.route.baseFare,
											totalRevenue: (activeVehicleTrip.passengers.length + manualPassengers) * activeVehicleTrip.route.baseFare,
											digitalRevenue: activeVehicleTrip.passengers.filter((p) => p.paymentMethod !== "CASH").reduce((acc) => acc + Number(activeVehicleTrip.route.baseFare), 0),
											cashDue: activeVehicleTrip.passengers.filter((p) => p.paymentMethod === "CASH").length * activeVehicleTrip.route.baseFare + manualPassengers * activeVehicleTrip.route.baseFare,
										};

										await endShift(); // This will set activeVehicleTrip to null
										setLastTripStats(stats); // This triggers the Summary Screen
										endShiftDisclosure.onOpenChange(false);
									}}>
									End Shift
								</Button>
							</View>
						</View>
					</BottomSheet.Content>
				</BottomSheet.Portal>
			</BottomSheet>

			<RequestModal isOpen={incomingRequests.length > 0} request={incomingRequests[0] || null} onClose={() => incomingRequests[0] && declineRequest(incomingRequests[0].id)} onAccept={acceptRequest} />
		</View>
	);
}

function PassengerCard({ passenger, onUpdateStatus, isUpdating }: { passenger: Trip; onUpdateStatus: (id: string, status: string) => Promise<void>; isUpdating: boolean }) {
	const getStatusColor = (status: string): "warning" | "primary" | "success" | "danger" | "default" => {
		switch (status) {
			case "ACCEPTED":
				return "warning";
			case "ARRIVED_AT_PICKUP":
				return "primary";
			case "IN_PROGRESS":
				return "success";
			case "CANCELLED":
				return "danger";
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
		if (passenger.status === "CANCELLED") {
			return {
				label: "Mark Arrived",
				color: "warning" as const,
				action: () => onUpdateStatus(passenger.id, "ARRIVED_AT_PICKUP"),
				icon: "lucide:map-pin-check",
			};
		}
		return null;
	};

	const action = getAction();

	return (
		<Card className='shadow-sm hover:shadow-md transition-shadow'>
			<Card.Body className='p-3'>
				<View className='flex items-center justify-between gap-3'>
					<View className='flex-1 min-w-0'>
						<View className='flex items-center gap-2 mb-1'>
							<Text className='font-semibold text-sm truncate'>{passenger.user?.firstName || "Passenger"}</Text>
							<Chip size='sm' color={getStatusColor(passenger.status) as any} className='h-5 text-[10px] px-1'>
								{passenger.status.replace(/_/g, " ")}
							</Chip>
						</View>
						<View className='flex items-center gap-1 text-xs text-default-500'>
							<Feather name='map-pin' width={10} />
							<Text className='truncate'>{passenger.dropoffAddress}</Text>
						</View>
					</View>

					{action && (
						<Button
							size='sm'
							onPress={() => {
								void action.action();
							}}
							isDisabled={isUpdating}
							className='min-w-[120px]'>
							{isUpdating ? "Updating..." : action.label}
						</Button>
					)}
				</View>
			</Card.Body>
		</Card>
	);
}
