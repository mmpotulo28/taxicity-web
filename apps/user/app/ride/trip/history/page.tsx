"use client";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Input, Tabs, Tab, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";

import { useRide } from "@/context/RideContext";
import TripCard from "@taxicity/ui/components/TripCard";
import { iTrip } from "@/types";
import TripModal from "@taxicity/ui/components/TripModal";

const TripHistory: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTab, setSelectedTab] = useState("all");
	const [selectedTrip, setSelectedTrip] = useState<iTrip | null>(null);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const { tripHistory } = useRide();

	const filteredTrips = useMemo(() => {
		let trips = tripHistory;

		// Filter by Tab
		if (selectedTab !== "all") {
			trips = trips.filter((trip) => trip.status === selectedTab);
		}

		// Filter by Search
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			trips = trips.filter(
				(trip) =>
					trip.route.toLowerCase().includes(query) ||
					trip.pickup.toLowerCase().includes(query) ||
					trip.dropoff.toLowerCase().includes(query) ||
					trip.driver.toLowerCase().includes(query) ||
					trip.date.includes(query),
			);
		}

		return trips;
	}, [searchQuery, selectedTab, tripHistory]);

	const handleTripSelect = (trip: iTrip) => {
		setSelectedTrip(trip);
		onOpen();
	};

	return (
		<motion.div
			animate={{ opacity: 1 }}
			className="h-full flex flex-col bg-default-50"
			initial={{ opacity: 0 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-background shadow-sm space-y-4">
				<div className="flex items-center gap-2">
					<h2 className="text-xl font-bold">Your Trips</h2>
					<div className="px-2 py-0.5 rounded-full bg-default-100 text-xs font-medium text-default-600">
						{tripHistory.length}
					</div>
				</div>

				<Input
					classNames={{
						inputWrapper: "bg-default-100",
					}}
					placeholder="Search by route, driver, or location..."
					startContent={<Icon className="text-default-400 text-lg" icon="lucide:search" />}
					value={searchQuery}
					isClearable
					onClear={() => setSearchQuery("")}
					onValueChange={setSearchQuery}
				/>

				<Tabs
					aria-label="Trip status"
					color="primary"
					variant="underlined"
					selectedKey={selectedTab}
					onSelectionChange={(key) => setSelectedTab(key as string)}
					classNames={{
						tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
						cursor: "w-full bg-primary",
						tab: "max-w-fit px-0 h-10",
						tabContent: "group-data-[selected=true]:text-primary font-medium"
					}}
				>
					<Tab key="all" title="All" />
					<Tab key="completed" title="Completed" />
					<Tab key="cancelled" title="Cancelled" />
				</Tabs>
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
				{filteredTrips.length > 0 ? (
					<div className="space-y-3 pb-20">
						{filteredTrips.map((trip) => (
							<TripCard
								key={trip.id}
								trip={trip}
								onSelect={() => handleTripSelect(trip)}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
						<div className="p-4 rounded-full bg-default-100 mb-4">
							<Icon
								className="text-4xl text-default-400"
								icon={searchQuery ? "lucide:search-x" : "lucide:history"}
							/>
						</div>
						<h3 className="text-lg font-semibold text-default-700">
							{searchQuery ? "No matches found" : "No trips yet"}
						</h3>
						<p className="text-sm text-default-500 mt-1 max-w-[250px]">
							{searchQuery
								? `We couldn't find any trips matching "${searchQuery}"`
								: selectedTab !== "all"
									? `You don't have any ${selectedTab} trips.`
									: "Your trip history will appear here once you've taken a ride."
							}
						</p>
					</div>
				)}
			</div>

			<TripModal isOpen={isOpen} trip={selectedTrip} onOpenChange={onOpenChange} />
		</motion.div>
	);
};

export default TripHistory;
