"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { useRide } from "@/context/RideContext";
import LocationSelector from "@taxicity/ui/components/LocationSelector";

const LocationPage: React.FC = () => {
	const router = useRouter();
	const {
		selectedRoute,
		pickupLocation,
		dropoffLocation,
		setPickupLocation,
		setDropoffLocation,
	} = useRide();

	const [step, setStep] = useState<1 | 2>(1);

	// Redirect if no route selected
	useEffect(() => {
		if (!selectedRoute) {
			router.push("/ride/route");
		}
	}, [selectedRoute, router]);

	// Reset locations on mount
	useEffect(() => {
		setPickupLocation("");
		setDropoffLocation("");
		setStep(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handlePickupContinue = () => {
		if (pickupLocation) setStep(2);
	};

	const handleDropoffContinue = () => {
		if (dropoffLocation) {
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
				{/* Stepper Progress */}
				<div className="flex items-center gap-2 mb-2">
					<div
						className={`w-6 h-6 rounded-full flex items-center justify-center ${
							step === 1 ? "bg-primary text-white" : "bg-default-200 text-default-500"
						}`}>
						1
					</div>
					<div className={`h-1 flex-1 ${step === 2 ? "bg-primary" : "bg-default-200"}`} />
					<div
						className={`w-6 h-6 rounded-full flex items-center justify-center ${
							step === 2 ? "bg-primary text-white" : "bg-default-200 text-default-500"
						}`}>
						2
					</div>
				</div>
				<div className="flex gap-2 text-xs text-default-500 mb-2">
					<span className={step === 1 ? "font-semibold text-primary" : ""}>Pickup</span>
					<span className="flex-1 text-center"> </span>
					<span className={step === 2 ? "font-semibold text-primary" : ""}>Drop-off</span>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
				{step === 1 && (
					<>
						<LocationSelector
							type="pickup"
							value={pickupLocation}
							onSelect={setPickupLocation}
						/>
						<Button
							className="w-full mt-4"
							color="primary"
							endContent={<Icon icon="lucide:arrow-right" />}
							isDisabled={!pickupLocation}
							size="lg"
							onPress={handlePickupContinue}>
							Confirm Pickup
						</Button>
					</>
				)}
				{step === 2 && (
					<>
						<LocationSelector
							type="dropoff"
							value={dropoffLocation}
							onSelect={setDropoffLocation}
						/>
						<Button
							className="w-full mt-4"
							color="primary"
							endContent={<Icon icon="lucide:arrow-right" />}
							isDisabled={!dropoffLocation}
							size="lg"
							onPress={handleDropoffContinue}>
							Find Taxis
						</Button>
						<Button
							className="w-full mt-2"
							color="default"
							variant="flat"
							startContent={<Icon icon="lucide:arrow-left" />}
							onPress={() => setStep(1)}>
							Back to Pickup
						</Button>
					</>
				)}
			</div>
		</motion.div>
	);
};

export default LocationPage;
