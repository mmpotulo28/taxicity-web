"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody, Input, Divider, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { useRide } from "@/context/RideContext";
import { popularLocations } from "@/lib/data";

const LocationPicker: React.FC = () => {
	const router = useRouter();
	const { setPickupLocation, setDropOffLocation, selectedRoute, selectedRank } = useRide();

	const [pickup, setPickup] = useState("");
	const [dropOff, setDropOff] = useState("");

	const handleSubmit = () => {
		if (pickup && dropOff) {
			setPickupLocation(pickup);
			setDropOffLocation(dropOff);

			// Navigate to taxi selection or confirmation page
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
				<div className="flex items-center gap-2 mb-4">
					<Button isIconOnly aria-label="Back" size="sm" variant="light">
						<Icon icon="lucide:arrow-left" />
					</Button>
					<h2 className="text-lg font-semibold">Set Your Locations</h2>
				</div>

				<Card className="mb-4">
					<CardBody className="p-3">
						<div className="flex items-center gap-2 text-sm">
							<Icon className="text-primary" icon="lucide:route" />
							<span className="font-medium">{selectedRoute?.name}</span>
							<Divider className="h-4" orientation="vertical" />
							<Icon className="text-danger text-sm" icon="lucide:map-pin" />
							<span className="text-default-500">{selectedRank?.name}</span>
						</div>
					</CardBody>
				</Card>

				<div className="relative">
					<div className="absolute left-3 top-0 bottom-0 flex flex-col items-center">
						<div className="w-3 h-3 rounded-full bg-primary mt-5" />
						<div className="w-0.5 h-10 bg-default-200" />
						<div className="w-3 h-3 rounded-full bg-danger mb-5" />
					</div>

					<div className="space-y-4 pl-8">
						<Input
							className="mb-2"
							label="Pickup Location"
							placeholder="Enter pickup point"
							value={pickup}
							onValueChange={setPickup}
						/>

						<Input
							className="mb-2"
							label="Drop-off Location"
							placeholder="Enter destination"
							value={dropOff}
							onValueChange={setDropOff}
						/>
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
				<h3 className="text-sm font-medium mb-3">Popular Locations</h3>

				<div className="flex flex-wrap gap-2 mb-6">
					{popularLocations?.map((location) => (
						<Chip
							key={location}
							color="primary"
							variant="flat"
							onClick={() => {
								if (!pickup) setPickup(location);
								else if (!dropOff) setDropOff(location);
							}}>
							{location}
						</Chip>
					))}
				</div>

				<div className="bg-default-50 p-3 rounded-medium mb-4">
					<div className="flex items-start gap-3">
						<Icon className="text-primary mt-0.5" icon="lucide:info" />
						<div>
							<h4 className="text-sm font-medium">About this route</h4>
							<p className="text-xs text-default-500 mt-1">
								This route operates from 5:00 AM to 8:00 PM daily. Taxis typically
								depart every 15-20 minutes when full. Cash payment is accepted on
								board.
							</p>
						</div>
					</div>
				</div>

				<Button
					className="w-full"
					color="primary"
					endContent={<Icon icon="lucide:arrow-right" />}
					isDisabled={!pickup || !dropOff}
					onPress={handleSubmit}>
					Find Available Taxis
				</Button>
			</div>
		</motion.div>
	);
};

export default LocationPicker;
