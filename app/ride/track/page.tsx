"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@heroui/modal";

import { useRide } from "@/context/RideContext";
import { MapView } from "@/components/map-view";
import TripCard from "@/components/TripCard";
import DriverCard from "@/components/DriverCard";
import TripModal from "@/components/TripModal";
const TrackRide: React.FC = () => {
	const router = useRouter();
	const { activeTrip, selectedTaxi, selectedRoute, cancelRide } = useRide();
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
	const [isDriverArrived, setIsDriverArrived] = useState(false);

	// If no active trip, redirect to home
	useEffect(() => {
		if (!activeTrip || !selectedTaxi) {
			router.push("/");
		}
	}, [activeTrip, selectedTaxi, router]);

	// Simulated driver arrival
	useEffect(() => {
		if (activeTrip) {
			// Simulate the driver arrival countdown
			const initialMinutes = Math.floor(Math.random() * 5) + 2; // 2-6 minutes

			setEstimatedTime(`${initialMinutes} min`);

			const countdown = setInterval(() => {
				setEstimatedTime((prev) => {
					const currentMin = parseInt(prev?.split(" ")[0] || "0");

					if (currentMin <= 1) {
						clearInterval(countdown);
						setIsDriverArrived(true);
						// routed to ride/trip/details
						router.push("/ride/trip/details");

						return "Arrived";
					}

					return `${currentMin - 1} min`;
				});
			}, 60000); // Update every minute

			// Cleanup
			return () => clearInterval(countdown);
		}
	}, [activeTrip]);

	useEffect(() => {
		if (isDriverArrived) {
			router.push("/ride/trip/details");
		}
	}, [isDriverArrived, router]);

	// Handle ride cancellation
	const handleCancelRide = () => {
		cancelRide();
		router.push("/");
	};

	if (!activeTrip || !selectedTaxi || !selectedRoute) {
		return null; // Will redirect in the useEffect
	}

	return (
		<motion.div
			animate={{ opacity: 1 }}
			className="h-full flex flex-col justify-between"
			initial={{ opacity: 0 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-background shadow-sm z-1 rounded-b-2xl">
				<h2 className="text-lg font-semibold mb-2">
					{isDriverArrived ? "Your Trip is in Progress" : "Your Taxi is Coming"}
				</h2>
				<p className="text-sm text-default-500">
					{isDriverArrived
						? "You are on your way to your destination"
						: `Arriving in ${estimatedTime}`}
				</p>
			</div>

			<MapView fullscreen showTaxis zIndex={0} />

			<div className="overflow-y-auto p-4 scrollbar-hidden flex flex-col gap-6">
				{/* Trip Info Card */}
				<TripCard trip={activeTrip} onSelect={() => onOpen()} />

				{/* Driver Info Card */}
				<DriverCard handleCancelRide={handleCancelRide} taxi={selectedTaxi} />
			</div>

			<TripModal isOpen={isOpen} trip={activeTrip} onOpenChange={onOpenChange} />
		</motion.div>
	);
};

export default TrackRide;
