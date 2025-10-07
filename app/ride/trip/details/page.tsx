"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody, Divider, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { useRide } from "@/context/RideContext";
import { MapView } from "@/components/map-view";
import TripModal from "@/components/TripModal";

const TripDetails: React.FC = () => {
	const router = useRouter();
	const { activeTrip } = useRide();
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	// If no active trip, redirect to home
	useEffect(() => {
		if (!activeTrip) {
			router.push("/");
		}
	}, [activeTrip, router]);

	if (!activeTrip) {
		return null; // Will redirect in the useEffect
	}

	return (
		<motion.div
			animate={{ opacity: 1 }}
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-background shadow-sm">
				<h2 className="text-lg font-semibold mb-2">Trip Completed</h2>
				<p className="text-sm text-default-500">Thank you for riding with TaxiCity</p>
			</div>

			{/* Map showing the completed route */}
			<div className="w-full h-40 mb-2">
				<MapView showTaxis={true} />
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
				{/* Trip Summary Card */}
				<Card className="mb-4">
					<CardBody className="p-4">
						<div className="flex items-center justify-between mb-3">
							<div>
								<h3 className="font-medium">{activeTrip.route}</h3>
								<p className="text-xs text-default-500">
									{activeTrip.date} • {activeTrip.time}
								</p>
							</div>
							<div className="bg-success-100 text-success-600 text-xs px-2 py-0.5 rounded-full">
								Completed
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="flex flex-col items-center">
								<div className="w-3 h-3 rounded-full bg-primary" />
								<div className="w-0.5 h-10 bg-default-200" />
								<div className="w-3 h-3 rounded-full bg-danger" />
							</div>

							<div className="flex-1">
								<div className="mb-3">
									<div className="text-sm font-medium">Pickup</div>
									<div className="text-xs text-default-500">
										{activeTrip.pickup}
									</div>
								</div>

								<div>
									<div className="text-sm font-medium">Drop-off</div>
									<div className="text-xs text-default-500">
										{activeTrip.dropoff}
									</div>
								</div>
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Payment Details Card */}
				<Card className="mb-4">
					<CardBody className="p-4">
						<h3 className="text-sm font-semibold mb-2">Payment Details</h3>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-default-500">Base Fare</span>
								<span>{activeTrip.fare}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-default-500">Service Fee</span>
								<span>R2.00</span>
							</div>
							<Divider className="my-2" />
							<div className="flex justify-between font-semibold">
								<span>Total</span>
								<span>
									R{(parseFloat(activeTrip.fare.replace("R", "")) + 2).toFixed(2)}
								</span>
							</div>
							<div className="flex justify-between text-xs mt-1">
								<span className="text-default-500">Payment Method</span>
								<span>{activeTrip.paymentMethod}</span>
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Driver Details Card */}
				<Card className="mb-4">
					<CardBody className="p-4">
						<h3 className="text-sm font-semibold mb-2">Driver & Vehicle</h3>
						<div className="flex items-center gap-3 mb-2">
							<div className="w-10 h-10 bg-default-100 rounded-full flex items-center justify-center">
								<Icon className="text-xl text-default-400" icon="lucide:user" />
							</div>
							<div>
								<p className="font-medium">{activeTrip.driver}</p>
								<p className="text-xs text-default-500">{activeTrip.vehicle}</p>
							</div>
						</div>
						<p className="text-xs text-default-500">
							License Plate: {activeTrip.licensePlate}
						</p>
					</CardBody>
				</Card>

				{/* Rate Experience */}
				<Card>
					<CardBody className="p-4">
						<h3 className="text-sm font-semibold mb-2">Rate Your Experience</h3>
						<div className="flex justify-center mb-3">
							{[1, 2, 3, 4, 5].map((star) => (
								<Icon
									key={star}
									className="text-2xl text-default-300 hover:text-yellow-500 cursor-pointer"
									icon="lucide:star"
								/>
							))}
						</div>
						<Button
							className="w-full"
							color="primary"
							variant="flat"
							onPress={() => router.push("/")}>
							Submit Rating
						</Button>
					</CardBody>
				</Card>

				{/* Actions */}
				<div className="flex gap-2 mt-4">
					<Button
						className="flex-1"
						color="primary"
						startContent={<Icon icon="lucide:home" />}
						variant="light"
						onPress={() => router.push("/")}>
						Go Home
					</Button>
					<Button
						className="flex-1"
						color="primary"
						startContent={<Icon icon="lucide:repeat" />}
						onPress={() => router.push("/ride/route")}>
						Book Again
					</Button>
				</div>
			</div>

			<TripModal isOpen={isOpen} trip={activeTrip} onOpenChange={onOpenChange} />
		</motion.div>
	);
};

export default TripDetails;
