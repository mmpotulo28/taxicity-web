"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { useRide } from "@/context/RideContext";
import TripModal from "@/components/TripModal";
import DriverCard from "@/components/DriverCard";
import TripCard from "@/components/TripCard";

const TripDetails: React.FC = () => {
	const router = useRouter();
	const { activeTrip, selectedTaxi } = useRide();
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

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden flex flex-col gap-4 justify-center">
				{/* Trip Summary Card */}
				<TripCard
					trip={activeTrip}
					onSelect={() => {
						onOpen();
					}}
				/>
				{/* Driver Details Card */}
				{selectedTaxi && <DriverCard handleCancelRide={() => {}} taxi={selectedTaxi} />}

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
				<div className="flex gap-2">
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
