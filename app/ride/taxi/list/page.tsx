"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";

import { useRide } from "@/context/RideContext";
import TaxiCard from "@/components/TaxiCard";
import { MapView } from "@/components/map-view";

const TaxiList: React.FC = () => {
	const router = useRouter();
	const { selectedRoute, taxis } = useRide();

	// If no route is selected, redirect to route selection
	useEffect(() => {
		if (!selectedRoute) {
			router.push("/ride/route");
		}
	}, [selectedRoute, router]);

	const availableTaxis = taxis.filter((taxi) => {
		const isAvailable = taxi.status === "available";
		const servesRoute = taxi.routeId === selectedRoute?.id;

		return isAvailable && servesRoute;
	});

	return (
		<div className="relative h-full">
			{/* Fullscreen map as background */}
			<MapView centerOnRank fullscreen showTaxis zIndex={0} />

			{/* Overlay content */}
			<div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col">
				<div className="p-4 bg-background backdrop-blur-sm rounded-b-2xl z-1">
					<h2 className="text-lg font-semibold mb-4">Available Taxis</h2>
					<div className="text-sm text-default-500">
						{availableTaxis.length} taxis available for your route
					</div>
				</div>

				{/* Middle space to see map with taxis */}
				<div className="flex-1" />

				{/* Bottom taxi list */}
				<div className="">
					<div className="max-h-[60vh] overflow-y-auto p-4 scrollbar-hidden">
						<div className="space-y-3">
							{availableTaxis.length > 0 ? (
								availableTaxis.map((taxi) => <TaxiCard key={taxi.id} taxi={taxi} />)
							) : (
								<div className="text-center py-8 bg-background/90 rounded-lg">
									<Icon
										className="text-4xl text-default-300 mx-auto mb-2"
										icon="lucide:alert-circle"
									/>
									<p className="text-default-500">
										No taxis available for this route at the moment
									</p>
									<Button
										className="mt-4"
										color="primary"
										variant="flat"
										onPress={() => router.push("/ride/route")}>
										Try Another Route
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TaxiList;
