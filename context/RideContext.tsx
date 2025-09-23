"use client";
import { iRank, iRoute, iTaxi, iTrip } from "@/types";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

type RideContextType = {
	selectedRoute: iRoute | null;
	setSelectedRoute: (route: iRoute | null) => void;
	selectedRank: iRank | null;
	setSelectedRank: (rank: iRank | null) => void;
	pickupLocation: string | null;
	setPickupLocation: (location: string | null) => void;
	dropOffLocation: string | null;
	setDropOffLocation: (location: string | null) => void;
	selectedTaxi: iTaxi | null;
	setSelectedTaxi: (taxi: iTaxi | null) => void;
	trip: iTrip | null;
	tripStarted: boolean;
	startTrip: () => boolean;
	endTrip: () => void;
	tripHistory: iTrip[];
};

const RideContext = createContext<RideContextType | undefined>(undefined);

const TRIP_STORAGE_KEY = "taxicity_trip";
const HISTORY_STORAGE_KEY = "taxicity_trip_history";

export const RideProvider = ({ children }: { children: ReactNode }) => {
	const [selectedRoute, setSelectedRoute] = useState<iRoute | null>(null);
	const [selectedRank, setSelectedRank] = useState<iRank | null>(null);
	const [pickupLocation, setPickupLocation] = useState<string | null>(null);
	const [dropOffLocation, setDropOffLocation] = useState<string | null>(null);
	const [selectedTaxi, setSelectedTaxi] = useState<iTaxi | null>(null);
	const [trip, setTrip] = useState<iTrip | null>(null);
	const [tripStarted, setTripStarted] = useState(false);
	const [tripHistory, setTripHistory] = useState<iTrip[]>([]);

	// Load trip and history from localStorage on mount
	useEffect(() => {
		const storedTrip = localStorage.getItem(TRIP_STORAGE_KEY);
		if (storedTrip) {
			setTrip(JSON.parse(storedTrip));
			setTripStarted(true);
		}
		const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
		if (storedHistory) {
			setTripHistory(JSON.parse(storedHistory));
		}
	}, []);

	// Persist trip to localStorage
	useEffect(() => {
		if (trip) {
			localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(trip));
		} else {
			localStorage.removeItem(TRIP_STORAGE_KEY);
		}
	}, [trip]);

	// Persist trip history to localStorage
	useEffect(() => {
		localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(tripHistory));
	}, [tripHistory]);

	const startTrip = () => {
		if (!selectedRoute || !selectedTaxi || !pickupLocation || !dropOffLocation) {
			alert("Please select route, taxi, and locations before starting the trip.");
			return false;
		}
		const now = new Date();
		const id = "trip-" + now.getTime();
		const date = now.toISOString().slice(0, 10);
		const time = now.toTimeString().slice(0, 5);

		const newTrip: iTrip = {
			id,
			date,
			time,
			route: selectedRoute.name,
			pickup: pickupLocation,
			dropoff: dropOffLocation,
			driver: selectedTaxi.driverName,
			vehicle: selectedTaxi.vehicleInfo,
			licensePlate: selectedTaxi.licensePlate,
			fare: selectedRoute.estimatedFare || "R0.00",
			status: "ongoing",
			paymentMethod: "Cash",
		};
		setTrip(newTrip);
		setTripStarted(true);
		return true;
	};

	const endTrip = () => {
		if (trip) {
			const completedTrip = { ...trip, status: "completed" as const };
			setTripHistory((prev) => [completedTrip, ...prev]);
		}
		setTrip(null);
		setTripStarted(false);
	};

	return (
		<RideContext.Provider
			value={{
				selectedRoute,
				setSelectedRoute,
				selectedRank,
				setSelectedRank,
				pickupLocation,
				setPickupLocation,
				dropOffLocation,
				setDropOffLocation,
				selectedTaxi,
				setSelectedTaxi,
				trip,
				tripStarted,
				startTrip,
				endTrip,
				tripHistory,
			}}>
			{children}
		</RideContext.Provider>
	);
};

export const useRide = () => {
	const context = useContext(RideContext);
	if (!context) {
		throw new Error("useRide must be used within a RideProvider");
	}
	return context;
};
