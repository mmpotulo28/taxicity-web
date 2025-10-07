"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { iTrip, iRoute, iRank, iTaxi } from "@/types";
import {
	trips as mockTrips,
	routes as mockRoutes,
	ranks as mockRanks,
	taxis as mockTaxis,
} from "@/lib/data";

interface RideContextType {
	tripHistory: iTrip[];
	routes: iRoute[];
	ranks: iRank[];
	taxis: iTaxi[];
	activeTrip: iTrip | null;
	selectedRoute: iRoute | null;
	selectedTaxi: iTaxi | null;
	pickupLocation: string;
	dropoffLocation: string;

	// Actions
	setActiveTrip: (trip: iTrip | null) => void;
	setSelectedRoute: (route: iRoute | null) => void;
	setSelectedTaxi: (taxi: iTaxi | null) => void;
	setPickupLocation: (location: string) => void;
	setDropoffLocation: (location: string) => void;
	requestRide: () => void;
	cancelRide: () => void;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export function RideProvider({ children }: { children: React.ReactNode }) {
	// State
	const [tripHistory, setTripHistory] = useState<iTrip[]>([]);
	const [routes, setRoutes] = useState<iRoute[]>([]);
	const [ranks, setRanks] = useState<iRank[]>([]);
	const [taxis, setTaxis] = useState<iTaxi[]>([]);
	const [activeTrip, setActiveTrip] = useState<iTrip | null>(null);
	const [selectedRoute, setSelectedRoute] = useState<iRoute | null>(null);
	const [selectedTaxi, setSelectedTaxi] = useState<iTaxi | null>(null);
	const [pickupLocation, setPickupLocation] = useState<string>("");
	const [dropoffLocation, setDropoffLocation] = useState<string>("");

	// Load mock data on mount
	useEffect(() => {
		setTripHistory(mockTrips);
		setRoutes(mockRoutes);
		setRanks(mockRanks);
		setTaxis(mockTaxis);
	}, []);

	// Request a new ride
	const requestRide = () => {
		if (!selectedRoute || !pickupLocation || !dropoffLocation) {
			console.error("Cannot request ride: missing required information");
			return;
		}

		// Find an available taxi for the selected route
		const availableTaxi = taxis.find(
			(taxi) => taxi.status === "available" && taxi.routes.includes(selectedRoute.id),
		);

		if (!availableTaxi) {
			console.error("No available taxis for this route");

			return;
		}

		// Get rank information
		const rank = ranks.find((r) => r.id === selectedRoute.rankId);

		if (!rank) {
			console.error("Invalid rank information");
			return;
		}

		// Create a new trip
		const newTrip: iTrip = {
			id: `trip${Date.now()}`,
			route: selectedRoute.name,
			date: new Date().toISOString().split("T")[0],
			time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			pickup: pickupLocation || rank.name,
			dropoff: dropoffLocation,
			fare: selectedRoute.estimatedFare.split(" - ")[0], // Take the lower fare estimate
			status: "in-progress",
			driver: availableTaxi.driver,
			vehicle: availableTaxi.model,
			licensePlate: availableTaxi.licensePlate,
			paymentMethod: "Cash",
		};

		// Update the active trip and add to history
		setActiveTrip(newTrip);
		setTripHistory((prev) => [newTrip, ...prev]);
		setSelectedTaxi(availableTaxi);

		// Update taxi status
		setTaxis((prev) =>
			prev.map((taxi) => (taxi.id === availableTaxi.id ? { ...taxi, status: "busy" } : taxi)),
		);
	};

	// Cancel the current active ride
	const cancelRide = () => {
		if (!activeTrip || !selectedTaxi) return;

		// Update the trip status
		const updatedTrip = { ...activeTrip, status: "cancelled" as const };

		setTripHistory((prev) =>
			prev.map((trip) => (trip.id === activeTrip.id ? updatedTrip : trip)),
		);

		// Reset active trip
		setActiveTrip(null);

		// Update taxi status back to available
		setTaxis((prev) =>
			prev.map((taxi) =>
				taxi.id === selectedTaxi.id ? { ...taxi, status: "available" } : taxi,
			),
		);

		setSelectedTaxi(null);
	};

	const value = {
		tripHistory,
		routes,
		ranks,
		taxis,
		activeTrip,
		selectedRoute,
		selectedTaxi,
		pickupLocation,
		dropoffLocation,

		setActiveTrip,
		setSelectedRoute,
		setSelectedTaxi,
		setPickupLocation,
		setDropoffLocation,
		requestRide,
		cancelRide,
	};

	return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
}

export function useRide() {
	const context = useContext(RideContext);
	if (context === undefined) {
		throw new Error("useRide must be used within a RideProvider");
	}
	return context;
}
