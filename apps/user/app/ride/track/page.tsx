"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { Switch, Card, CardBody, Chip } from "@heroui/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { addToast } from "@heroui/toast";
import { useVehicleTracker } from "../../../hooks/useVehicleTracker";

import { useRide, MapView, TripCard, TripModal } from "@taxicity/ui";


const TrackRide: React.FC = () => {
	const router = useRouter();
	const { activeTrip, selectedRoute, cancelRide, startRide, completeRide, isRestoring, shareRide, taxis } = useRide();
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const { isOpen: isScannerOpen, onOpen: onScannerOpen, onOpenChange: onScannerOpenChange } = useDisclosure();

	const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
	const [isScanning, setIsScanning] = useState(false);
	const [useSimulation, setUseSimulation] = useState(false);

	const activeTaxi = activeTrip ? taxis.find(t => t.id === activeTrip.taxiId) : null;
	const { location: trackedLocation } = useVehicleTracker(activeTrip?.taxiId || null);

	const currentTaxiLocation = trackedLocation ? {
		lat: trackedLocation.lat,
		lng: trackedLocation.lng,
		heading: trackedLocation.heading
	} : activeTaxi?.location;

	// If no active trip, redirect to home
	useEffect(() => {
		if (isRestoring) return;
		if (!activeTrip) {
			router.push("/");
		} else if (activeTrip.status === "completed") {
			router.push("/ride/trip/details");
		}
	}, [activeTrip, router, isRestoring]);

	// Simulated driver arrival logic (Visual only - state updates come from polling)
	useEffect(() => {
		if ((activeTrip?.status === "requested" || activeTrip?.status === "accepted") && activeTrip.driver !== "Pending Assignment") {
			// Only run countdown if we haven't arrived yet
			const initialMinutes = Math.floor(Math.random() * 3) + 1; // 1-3 minutes for demo
			setEstimatedTime(`${initialMinutes} min`);

			const countdown = setInterval(() => {
				setEstimatedTime((prev) => {
					const currentMin = parseInt(prev?.split(" ")[0] || "0");
					if (currentMin <= 1) {
						clearInterval(countdown);
						// driverArrived(); // Removed: Let polling handle the state change
						return "Arriving soon";
					}
					return `${currentMin - 1} min`;
				});
			}, 10000); // Fast countdown for demo (10s = 1min)

			return () => clearInterval(countdown);
		}
	}, [activeTrip?.status, activeTrip?.driver]);

	const handleScanSuccess = () => {
		setIsScanning(true);
		// Simulate scanning delay
		setTimeout(() => {
			setIsScanning(false);
			startRide();
			onScannerOpenChange();
		}, 1500);
	};

	const handleRealScan = (result: IDetectedBarcode[]) => {
		if (result && result.length > 0) {
			const scannedValue = result[0].rawValue;
			console.log("QR Code scanned:", scannedValue);

			let scannedTaxiId = scannedValue;

			// Try to parse JSON if it's a JSON string (DriverConsole generates JSON)
			try {
				const parsed = JSON.parse(scannedValue);
				if (parsed.taxiId) {
					scannedTaxiId = parsed.taxiId;
				}
			} catch {
				// Not JSON, assume it's the ID directly
			}

			if (activeTrip?.taxiId && scannedTaxiId === activeTrip.taxiId) {
				startRide();
				onScannerOpenChange();
			} else {
				addToast({
					title: "Invalid QR Code",
					description: "The scanned QR code does not match your assigned taxi.",
					color: "danger",
				});
			}
		}
	};

	if (isRestoring || !activeTrip) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	// --- VIEW COMPONENTS ---

	const WaitingView = () => {
		const isAssigned = activeTrip.driver !== "Pending Assignment";

		return (
			<div className="absolute bottom-0 left-0 right-0 p-4 z-10">
				<Card className="w-full shadow-lg bg-background/95 backdrop-blur-md border-t border-default-200">
					<CardBody className="p-4">
						<div className="flex justify-between items-center mb-4">
							<div>
								<h2 className="text-lg font-bold">{isAssigned ? "Driver is on the way" : "Searching for driver..."}</h2>
								<p className="text-default-500 text-sm">{isAssigned ? `Arriving in ${estimatedTime}` : "Please wait"}</p>
							</div>
							{isAssigned && (
								<Chip color="warning" variant="flat" startContent={<Icon icon="lucide:clock" />}>
									{estimatedTime}
								</Chip>
							)}
						</div>

						{isAssigned ? (
							<div className="flex items-center gap-4 mb-6 bg-default-50 p-3 rounded-xl">
								<div className="w-12 h-12 bg-default-200 rounded-full flex items-center justify-center">
									<Icon icon="lucide:user" className="text-2xl text-default-500" />
								</div>
								<div className="flex-1">
									<p className="font-semibold">{activeTrip.driver}</p>
									<p className="text-xs text-default-500">{activeTrip.vehicle} • {activeTrip.licensePlate}</p>
								</div>
								<div className="flex gap-2">
									<Button isIconOnly size="sm" variant="flat" color="primary">
										<Icon icon="lucide:phone" />
									</Button>
									<Button isIconOnly size="sm" variant="flat" color="default">
										<Icon icon="lucide:message-circle" />
									</Button>
								</div>
							</div>
						) : (
							<div className="flex items-center justify-center py-8">
								<div className="animate-pulse flex flex-col items-center">
									<Icon icon="lucide:radar" className="text-4xl text-primary mb-2" />
									<p className="text-default-500">Contacting nearby drivers...</p>
								</div>
							</div>
						)}

						<Button
							color="danger"
							variant="light"
							className="w-full"
							onPress={cancelRide}
						>
							Cancel Request
						</Button>
					</CardBody>
				</Card>
			</div>
		);
	};

	const BoardingView = () => (
		<div className="absolute bottom-0 left-0 right-0 p-4 z-10">
			<Card className="w-full shadow-lg bg-background/95 backdrop-blur-md border-t-4 border-primary">
				<CardBody className="p-6 text-center">
					<div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
						<Icon icon="lucide:check" className="text-3xl" />
					</div>
					<h2 className="text-xl font-bold mb-2">Driver Arrived!</h2>
					<p className="text-default-500 mb-6">Please locate your taxi ({activeTrip.licensePlate}) and scan the QR code to board.</p>

					<Button
						color="primary"
						size="lg"
						className="w-full font-semibold shadow-lg shadow-primary/20"
						startContent={<Icon icon="lucide:qr-code" />}
						onPress={onScannerOpen}
					>
						Scan QR Code
					</Button>
				</CardBody>
			</Card>
		</div>
	);

	const TrackingView = () => (
		<div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col max-h-[50vh]">
			{/* Floating Trip Card */}
			<div className="px-4 mb-2">
				<TripCard trip={activeTrip} onSelect={onOpen} />
			</div>

			{/* Scrollable Stops List */}
			<div className="bg-background rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex-1 overflow-hidden flex flex-col">
				<div className="w-12 h-1.5 bg-default-200 rounded-full mx-auto mt-3 mb-2" />

				<div className="px-4 pb-2 border-b border-default-100">
					<div className="flex justify-between items-center">
						<h3 className="font-semibold flex items-center gap-2">
							<Icon icon="lucide:route" className="text-primary" />
							Route Progress
						</h3>
						<span className="text-xs font-medium text-default-500">
							{selectedRoute?.popularLocations?.length || 0} stops
						</span>
					</div>
				</div>

				<div className="overflow-y-auto p-4 space-y-0 relative">
					{/* Vertical Line */}
					<div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-default-200" />

					{selectedRoute?.popularLocations?.map((stop, index) => (
						<div key={stop.id} className="relative flex gap-4 pb-6 last:pb-0 group">
							{/* Dot */}
							<div className={`relative z-10 w-3 h-3 mt-1.5 rounded-full border-2 flex-shrink-0
								${index === 0 ? "bg-primary border-primary ring-4 ring-primary/20" : "bg-background border-default-400"}`}
							/>

							<div className="flex-1">
								<div className="flex justify-between items-start">
									<p className={`text-sm font-medium ${index === 0 ? "text-primary" : "text-default-700"}`}>
										{stop.name}
									</p>
									{index === 0 && (
										<Chip size="sm" color="primary" variant="flat" className="h-5 text-[10px]">
											NEXT
										</Chip>
									)}
								</div>
								<p className="text-xs text-default-500 truncate">{stop.address}</p>
							</div>
						</div>
					))}

					{/* Destination */}
					<div className="relative flex gap-4 pt-2">
						<div className="relative z-10 w-3 h-3 mt-1.5 rounded-full border-2 bg-background border-danger flex-shrink-0" />
						<div className="flex-1">
							<p className="text-sm font-medium text-default-900">Destination</p>
							<p className="text-xs text-default-500">{activeTrip.dropoff}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<div className="h-full relative bg-default-100 overflow-hidden">
			{/* Map Layer */}
			<div className="absolute inset-0 z-0">
				<MapView
					fullscreen
					showTaxis={activeTrip.status !== "in-progress"}
					showRoute={activeTrip.status === "in-progress"}
					zIndex={0}
					taxiLocation={currentTaxiLocation}
				/>
			</div>

			{/* Top Bar Overlay */}
			<div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start pointer-events-none">
				<Button
					isIconOnly
					className="bg-background/80 backdrop-blur-md shadow-sm pointer-events-auto"
					onPress={() => router.back()}
				>
					<Icon icon="lucide:arrow-left" />
				</Button>

				{activeTrip.status === "in-progress" && (
					<div className="flex gap-2 pointer-events-auto items-start">
						<Card className="bg-background/90 backdrop-blur-md shadow-sm hidden sm:flex">
							<CardBody className="py-2 px-4 flex flex-row items-center gap-3">
								<div className="flex flex-col items-end">
									<span className="text-[10px] text-default-500 uppercase font-bold">Arrival</span>
									<span className="text-sm font-bold text-primary">14:35</span>
								</div>
								<div className="h-6 w-[1px] bg-default-200" />
								<div className="flex flex-col items-start">
									<span className="text-[10px] text-default-500 uppercase font-bold">Distance</span>
									<span className="text-sm font-bold">4.2 km</span>
								</div>
							</CardBody>
						</Card>
						<Button
							size="sm"
							color="warning"
							variant="flat"
							className="bg-warning/10 backdrop-blur-md shadow-sm font-semibold"
							onPress={() => {
								completeRide();
								router.push("/ride/trip/details");
							}}
						>
							Simulate Arrival
						</Button>
						<Button
							isIconOnly
							className="bg-background/80 backdrop-blur-md shadow-sm"
							onPress={shareRide}
						>
							<Icon icon="lucide:share-2" />
						</Button>
					</div>
				)}
			</div>

			{/* State-based UI */}
			<AnimatePresence mode="wait">
				{(activeTrip.status === "requested" || activeTrip.status === "accepted") && (
					<motion.div
						key="waiting"
						initial={{ y: 100, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 100, opacity: 0 }}
					>
						<WaitingView />
					</motion.div>
				)}

				{activeTrip.status === "driver-arrived" && (
					<motion.div
						key="boarding"
						initial={{ y: 100, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 100, opacity: 0 }}
					>
						<BoardingView />
					</motion.div>
				)}

				{activeTrip.status === "in-progress" && (
					<motion.div
						key="tracking"
						initial={{ y: 100, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 100, opacity: 0 }}
						className="h-full flex flex-col justify-end"
					>
						<TrackingView />
					</motion.div>
				)}
			</AnimatePresence>

			{/* Scanner Modal */}
			<Modal isOpen={isScannerOpen} placement="center" onOpenChange={onScannerOpenChange}>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">
								<span>Scan Driver QR Code</span>
								<div className="flex items-center gap-2 mt-2">
									<Switch
										isSelected={useSimulation}
										size="sm"
										onValueChange={setUseSimulation}
									>
										<span className="text-xs text-default-500">Simulate Scan</span>
									</Switch>
								</div>
							</ModalHeader>
							<ModalBody>
								<div className="flex flex-col items-center justify-center gap-4 py-4">
									<div className="relative w-64 h-64 bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center">
										{useSimulation ? (
											<>
												{/* Camera View Simulation */}
												<div className="absolute inset-0 border-2 border-primary/50 z-10 m-8 rounded-lg">
													<div className="absolute top-0 left-0 w-full h-1 bg-primary/80 animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
												</div>
												<div className="flex flex-col items-center gap-2 text-zinc-500">
													<Icon icon="lucide:camera-off" width={48} />
													<span className="text-xs font-medium">Camera Simulation</span>
												</div>
												<p className="absolute bottom-4 text-white/80 text-xs z-20">Align QR code within frame</p>
											</>
										) : (
											<div className="w-full h-full">
												<Scanner
													onScan={(result) => handleRealScan(result)}
													onError={(error) => console.error(error)}
													components={{
														onOff: false,
														torch: false,
														zoom: false,
														finder: true,
													}}
													styles={{
														container: { width: "100%", height: "100%" },
														video: { width: "100%", height: "100%", objectFit: "cover" }
													}}
												/>
											</div>
										)}
									</div>
									<p className="text-center text-sm text-default-500">
										Scan the QR code displayed on the driver&apos;s dashboard to confirm your ride.
									</p>
								</div>
							</ModalBody>
							<ModalFooter>
								<Button color="danger" variant="light" onPress={onClose}>
									Cancel
								</Button>
								{useSimulation && (
									<Button color="primary" isLoading={isScanning} onPress={handleScanSuccess}>
										{isScanning ? "Verifying..." : "Simulate Scan"}
									</Button>
								)}
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			<TripModal isOpen={isOpen} trip={activeTrip} onOpenChange={onOpenChange} />
		</div>
	);
};

export default TrackRide;
