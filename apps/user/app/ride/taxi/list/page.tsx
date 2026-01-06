"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { Card, CardBody } from "@heroui/card";

import { useRide } from "@/context/RideContext";
import { MapView } from "@taxicity/ui/components/map-view";

const TaxiList: React.FC = () => {
	const router = useRouter();
	const { selectedRoute, taxis, requestRide, activeTrip } = useRide();
	const [isRequesting, setIsRequesting] = useState(false);

	// If no route is selected, redirect to route selection
	useEffect(() => {
		if (!selectedRoute) {
			router.push("/ride/route");
		}
	}, [selectedRoute, router]);

	// If trip is created, go to track page
	useEffect(() => {
		if (activeTrip) {
			router.push("/ride/track");
		}
	}, [activeTrip, router]);

	const availableTaxis = taxis.filter((taxi) => {
		const isAvailable = taxi.status === "available";
		const servesRoute = taxi.routeId === selectedRoute?.id;
		return isAvailable && servesRoute;
	});

	const handleRequestRide = async () => {
		setIsRequesting(true);
		await requestRide();
		setIsRequesting(false);
	};

	return (
		<div className="relative h-full flex flex-col">
			{/* Fullscreen map as background */}
			<div className="absolute inset-0 z-0">
				<MapView centerOnRank fullscreen showTaxis zIndex={0} />
			</div>

			{/* Overlay content */}
			<div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col pointer-events-none">
				{/* Header */}
				<div className="p-4 bg-background/80 backdrop-blur-md rounded-b-2xl z-10 pointer-events-auto shadow-sm">
					<h2 className="text-lg font-semibold">Confirm Ride</h2>
					<div className="flex items-center gap-2 text-sm text-default-500 mt-1">
						<Icon icon="lucide:map-pin" />
						<span>{selectedRoute?.name}</span>
					</div>
				</div>

				{/* Middle space */}
				<div className="flex-1" />

				{/* Bottom Action Panel */}
				<div className="p-4 pointer-events-auto">
					<Card className="w-full shadow-lg border-none bg-background/90 backdrop-blur-md">
						<CardBody className="p-4 space-y-4">
							<div className="flex justify-between items-center">
								<div>
									<p className="text-sm text-default-500">Estimated Fare</p>
									<p className="text-2xl font-bold text-primary">{selectedRoute?.estimatedFare}</p>
								</div>
								<div className="text-right">
									<p className="text-sm text-default-500">Nearby Taxis</p>
									<div className="flex items-center justify-end gap-1">
										<Icon icon="lucide:car-taxi-front" className="text-primary" />
										<span className="text-xl font-semibold">{availableTaxis.length}</span>
									</div>
								</div>
							</div>

							<div className="flex gap-3 items-center p-3 bg-default-100 rounded-xl">
								<div className="p-2 bg-background rounded-lg shadow-sm">
									<Icon icon="lucide:clock" className="text-default-500" />
								</div>
								<div>
									<p className="text-sm font-medium">Wait Time</p>
									<p className="text-xs text-default-500">
										{availableTaxis.length > 0 ? "2-5 mins" : "High demand"}
									</p>
								</div>
							</div>

							<Button
								size="lg"
								color="primary"
								className="w-full font-semibold shadow-md"
								onPress={handleRequestRide}
								isLoading={isRequesting}
								startContent={!isRequesting && <Icon icon="lucide:check-circle" width={20} />}
							>
								{isRequesting ? "Requesting..." : "Request Ride Now"}
							</Button>
						</CardBody>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default TaxiList;
