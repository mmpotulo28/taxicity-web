"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody, CardHeader, Divider, Chip, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { useRide, TripModal, MapView } from "@taxiciti/ui";


const TripDetails: React.FC = () => {
	const router = useRouter();
	const { activeTrip, selectedTaxi, shareRide, resetRide } = useRide();
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	// If no active trip, redirect to home
	useEffect(() => {
		if (!activeTrip) {
			router.push("/");
		}
	}, [activeTrip, router]);

	const handleFinish = () => {
		resetRide();
		router.push("/");
	};

	if (!activeTrip) {
		return null;
	}

	return (
		<div className="h-full relative bg-default-100 overflow-hidden">
			{/* Map Background */}
			<div className="absolute inset-0 z-0">
				<MapView
					fullscreen
					showRoute={true}
					zIndex={0}
				/>
			</div>

			{/* Content Overlay */}
			<div className="absolute inset-0 z-10 flex flex-col bg-background/60 backdrop-blur-md overflow-y-auto">
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full"
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.4 }}>

					{/* Header */}
					<div className="py-8 text-center">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
							className="w-20 h-20 bg-success text-success-foreground rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-success/20"
						>
							<Icon icon="lucide:check" className="text-4xl" />
						</motion.div>
						<h1 className="text-2xl font-bold text-foreground">Trip Completed</h1>
						<p className="text-default-500">Thank you for riding with TaxiCity</p>
					</div>

					{/* Receipt Card */}
					<Card className="w-full shadow-lg border border-default-200 mb-4 bg-background/90 backdrop-blur-sm">
						<CardHeader className="flex flex-col gap-1 pb-0">
							<div className="flex justify-between w-full items-center">
								<span className="text-xs font-bold text-default-400 uppercase tracking-wider">Receipt</span>
								<Chip size="sm" variant="flat" color="success">{activeTrip.date}</Chip>
							</div>
						</CardHeader>
						<CardBody className="gap-6">
							{/* Route */}
							<div className="flex flex-col gap-4">
								<div className="flex gap-3">
									<div className="flex flex-col items-center gap-1 pt-1">
										<div className="w-2 h-2 rounded-full bg-primary" />
										<div className="w-0.5 h-full bg-default-200" />
										<div className="w-2 h-2 rounded-full bg-danger" />
									</div>
									<div className="flex flex-col gap-4 flex-1">
										<div>
											<p className="text-xs text-default-500">Pickup</p>
											<p className="font-medium text-sm">{activeTrip.pickup}</p>
											<p className="text-xs text-default-400">{activeTrip.time}</p>
										</div>
										<div>
											<p className="text-xs text-default-500">Dropoff</p>
											<p className="font-medium text-sm">{activeTrip.dropoff}</p>
											<p className="text-xs text-default-400">14:45</p>
										</div>
									</div>
								</div>
							</div>

							<Divider />

							{/* Driver */}
							{selectedTaxi && (
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-default-100 rounded-full flex items-center justify-center">
										<Icon icon="lucide:user" className="text-default-500" />
									</div>
									<div className="flex-1">
										<p className="text-sm font-medium">{selectedTaxi.driver}</p>
										<p className="text-xs text-default-500">{selectedTaxi.model} • {selectedTaxi.licensePlate}</p>
										{activeTrip.passengerCount !== undefined && (
											<p className="text-xs text-default-400 mt-0.5 flex items-center gap-1">
												<Icon icon="lucide:users" className="w-3 h-3" />
												{activeTrip.passengerCount} Passengers
											</p>
										)}
									</div>
									<div className="flex flex-col items-end">
										<div className="flex items-center gap-1 text-warning">
											<Icon icon="lucide:star" className="text-xs fill-current" />
											<span className="text-xs font-bold">{selectedTaxi.rating}</span>
										</div>
									</div>
								</div>
							)}

							<Divider />

							{/* Payment */}
							<div className="flex justify-between items-end">
								<div>
									<p className="text-xs text-default-500 mb-1">Total Fare</p>
									<div className="flex items-center gap-2">
										<Icon icon="lucide:banknote" className="text-default-400" />
										<span className="text-sm text-default-700">{activeTrip.paymentMethod}</span>
									</div>
								</div>
								<p className="text-2xl font-bold text-primary">{activeTrip.fare}</p>
							</div>
						</CardBody>
					</Card>

					{/* Rating Section */}
					<Card className="shadow-sm border border-default-200 mb-6 bg-background/90 backdrop-blur-sm">
						<CardBody className="p-4 text-center">
							<h3 className="text-sm font-semibold mb-3">Rate Your Experience</h3>
							<div className="flex justify-center gap-2 mb-4">
								{[1, 2, 3, 4, 5].map((star) => (
									<button key={star} className="focus:outline-none transition-transform hover:scale-110">
										<Icon
											className="text-3xl text-default-200 hover:text-warning cursor-pointer transition-colors"
											icon="lucide:star"
										/>
									</button>
								))}
							</div>
							<Button
								color="primary"
								variant="flat"
								className="w-full font-medium"
								onPress={handleFinish}
							>
								Submit Rating
							</Button>
						</CardBody>
					</Card>

					{/* Footer Actions */}
					<div className="mt-auto flex gap-3 pb-4">
						<Button
							className="flex-1 font-medium bg-background/80 backdrop-blur-md"
							variant="bordered"
							startContent={<Icon icon="lucide:share-2" />}
							onPress={shareRide}
						>
							Share
						</Button>
						<Button
							className="flex-1 font-medium shadow-lg shadow-primary/20"
							color="primary"
							startContent={<Icon icon="lucide:home" />}
							onPress={handleFinish}
						>
							Home
						</Button>
					</div>
				</motion.div>
			</div>

			<TripModal isOpen={isOpen} trip={activeTrip} onOpenChange={onOpenChange} />
		</div>
	);
};

export default TripDetails;
