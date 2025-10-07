"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { useRide } from "@/context/RideContext";
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
		<motion.div
			animate={{ opacity: 1 }}
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-background shadow-sm">
				<h2 className="text-lg font-semibold mb-4">Select Your Locations</h2>

				{selectedRoute && (
					<Card className="mb-4">
						<CardBody className="p-3">
							<div className="flex items-center gap-2">
								<Icon className="text-primary" icon="lucide:route" />
								<div>
									<h3 className="font-medium text-sm">{selectedRoute.name}</h3>
									<p className="text-xs text-default-500">
										{selectedRoute.estimatedDuration} • {selectedRoute.distance}
									</p>
								</div>
							</div>
						</CardBody>
					</Card>
				)}
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
				{/* Pickup location selector */}
				<LocationSelector
					type="pickup"
					value={pickupLocation}
					onSelect={setPickupLocation}
				/>

				{/* Dropoff location selector */}
				<LocationSelector
					type="dropoff"
					value={dropoffLocation}
					onSelect={setDropoffLocation}
				/>

				{/* Continue button */}
				<Button
					className="w-full mt-4"
					color="primary"
					endContent={<Icon icon="lucide:arrow-right" />}
					isDisabled={!isFormValid}
					size="lg"
					onPress={handleContinue}>
					Continue
				</Button>
			</div>
		</motion.div>
	);
};

export default LocationPage;
