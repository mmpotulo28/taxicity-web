"use client";
import React from "react";
import { motion } from "framer-motion";
import { Input, Tabs, Tab, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRide } from "@/context/RideContext";
import TripCard from "@/components/TripCard";
import { iTrip } from "@/types";
import TripModal from "@/components/TripModal";

const TripHistory: React.FC = () => {
	const [searchQuery, setSearchQuery] = React.useState("");
	const [selectedTrip, setSelectedTrip] = React.useState<iTrip | null>(null);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const { tripHistory } = useRide();

	const filteredTrips = React.useMemo(() => {
		if (!searchQuery) return tripHistory;

		const query = searchQuery.toLowerCase();
		return tripHistory.filter(
			(trip) =>
				trip.route.toLowerCase().includes(query) ||
				trip.pickup.toLowerCase().includes(query) ||
				trip.dropoff.toLowerCase().includes(query) ||
				trip.driver.toLowerCase().includes(query) ||
				trip.date.includes(query),
		);
	}, [searchQuery, tripHistory]);

	const handleTripSelect = (trip: iTrip) => {
		setSelectedTrip(trip);
		onOpen();
	};

	return (
		<motion.div
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-background shadow-sm">
				<h2 className="text-lg font-semibold mb-4">Trip History</h2>
				<Input
					placeholder="Search trips"
					value={searchQuery}
					onValueChange={setSearchQuery}
					startContent={<Icon icon="lucide:search" className="text-default-400" />}
					className="mb-2"
				/>

				<Tabs aria-label="Trip options" color="primary" variant="underlined">
					<Tab key="all" title="All Trips" />
					<Tab key="completed" title="Completed" />
					<Tab key="cancelled" title="Cancelled" />
				</Tabs>
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
				{filteredTrips.length > 0 ? (
					<div className="space-y-3">
						{filteredTrips.map((trip) => (
							<TripCard
								key={trip.id}
								trip={trip}
								onSelect={() => handleTripSelect(trip)}
							/>
						))}
					</div>
				) : (
					<div className="text-center py-8">
						<Icon
							icon="lucide:search-x"
							className="text-4xl text-default-300 mx-auto mb-2"
						/>
						<p className="text-default-500">No trips found matching "{searchQuery}"</p>
					</div>
				)}
			</div>

			<TripModal trip={selectedTrip} isOpen={isOpen} onOpenChange={onOpenChange} />
		</motion.div>
	);
};

export default TripHistory;
