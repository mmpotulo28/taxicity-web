"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { useRide } from "@/context/RideContext";
import { MapView } from "@/components/map-view";
import LocationSelector from "@/components/LocationSelector";

const LocationPage: React.FC = () => {
	const router = useRouter();
	const {
		selectedRoute,
		pickupLocation,
		dropoffLocation,
		setPickupLocation,
		setDropoffLocation,
	} = useRide();

	const [isFormValid, setIsFormValid] = useState(false);

	// If no route is selected, redirect to route selection
	useEffect(() => {
		if (!selectedRoute) {
			router.push("/ride/route");
		}
	}, [selectedRoute, router]);

	// Form validation
	useEffect(() => {
		setIsFormValid(!!pickupLocation && !!dropoffLocation);
	}, [pickupLocation, dropoffLocation]);

	const handleContinue = () => {
		if (isFormValid) {
			router.push("/ride/taxi/list");
		}
	};

	return (
		<div className="relative h-full">
			{/* Fullscreen map as background */}
			<MapView fullscreen={true} zIndex={0} />

			{/* Overlay content */}
			<div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col pointer-events-none">
				{/* Top header */}
				<div className="bg-background backdrop-blur-sm p-4 pointer-events-auto">
					<h2 className="text-lg font-semibold mb-4">Select Your Locations</h2>

					{selectedRoute && (
						<Card className="mb-4 bg-default-50">
							<CardBody className="p-3">
								<div className="flex items-center gap-2">
									<Icon className="text-primary" icon="lucide:route" />
									<div>
										<h3 className="font-medium text-sm">
											{selectedRoute.name}
										</h3>
										<p className="text-xs text-default-500">
											{selectedRoute.estimatedDuration} •{" "}
											{selectedRoute.distance}
										</p>
									</div>
								</div>
							</CardBody>
						</Card>
					)}
				</div>

				{/* Middle space for map interaction */}
				<div className="flex-1" />

				{/* Bottom controls */}
				<div className="p-4 space-y-3 pointer-events-auto">
					{/* Pickup location selector */}
					<LocationSelector type="pickup" onSelect={setPickupLocation} />

					{/* Dropoff location selector */}
					<LocationSelector type="dropoff" onSelect={setDropoffLocation} />

					{/* Continue button */}
					<Button
						className="w-full mt-2 opacity-100"
						color="primary"
						endContent={<Icon icon="lucide:arrow-right" />}
						isDisabled={!isFormValid}
						size="lg"
						onPress={handleContinue}>
						Continue
					</Button>
				</div>
			</div>
		</div>
	);
};

export default LocationPage;
