import React, { createContext, useContext, useState, ReactNode } from "react";

type RideContextType = {
	selectedRoute: string | null;
	setSelectedRoute: (route: string | null) => void;
	selectedRank: string | null;
	setSelectedRank: (rank: string | null) => void;
	pickupLocation: string | null;
	setPickupLocation: (location: string | null) => void;
	dropoffLocation: string | null;
	setDropoffLocation: (location: string | null) => void;
	selectedTaxi: string | null;
	setSelectedTaxi: (taxi: string | null) => void;
};

const RideContext = createContext<RideContextType | undefined>(undefined);

export const RideProvider = ({ children }: { children: ReactNode }) => {
	const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
	const [selectedRank, setSelectedRank] = useState<string | null>(null);
	const [pickupLocation, setPickupLocation] = useState<string | null>(null);
	const [dropoffLocation, setDropoffLocation] = useState<string | null>(null);
	const [selectedTaxi, setSelectedTaxi] = useState<string | null>(null);

	return (
		<RideContext.Provider
			value={{
				selectedRoute,
				setSelectedRoute,
				selectedRank,
				setSelectedRank,
				pickupLocation,
				setPickupLocation,
				dropoffLocation,
				setDropoffLocation,
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
