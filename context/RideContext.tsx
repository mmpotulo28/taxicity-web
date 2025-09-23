"use client";
import { iRank, iRoute, iTaxi } from "@/types";
import React, { createContext, useContext, useState, ReactNode } from "react";

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
};

const RideContext = createContext<RideContextType | undefined>(undefined);

export const RideProvider = ({ children }: { children: ReactNode }) => {
	const [selectedRoute, setSelectedRoute] = useState<iRoute | null>(null);
	const [selectedRank, setSelectedRank] = useState<iRank | null>(null);
	const [pickupLocation, setPickupLocation] = useState<string | null>(null);
	const [dropOffLocation, setDropOffLocation] = useState<string | null>(null);
	const [selectedTaxi, setSelectedTaxi] = useState<iTaxi | null>(null);

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
