import { create } from "zustand";
import type { RideRequestResponseDto, RouteDto, TaxiDto } from "../dto/ride-funnel.dto";

interface RideFunnelState {
	selectedRoute: RouteDto | null;
	selectedTaxi: TaxiDto | null;
	pickupAddress: string;
	dropoffAddress: string;
	activeTrip: RideRequestResponseDto | null;
	setSelectedRoute: (route: RouteDto | null) => void;
	setSelectedTaxi: (taxi: TaxiDto | null) => void;
	setPickupAddress: (value: string) => void;
	setDropoffAddress: (value: string) => void;
	setActiveTrip: (trip: RideRequestResponseDto | null) => void;
	reset: () => void;
}

const initialState = {
	selectedRoute: null,
	selectedTaxi: null,
	pickupAddress: "",
	dropoffAddress: "",
	activeTrip: null,
};

export const useRideFunnelStore = create<RideFunnelState>((set) => ({
	...initialState,
	setSelectedRoute: (route) => set({ selectedRoute: route }),
	setSelectedTaxi: (taxi) => set({ selectedTaxi: taxi }),
	setPickupAddress: (value) => set({ pickupAddress: value }),
	setDropoffAddress: (value) => set({ dropoffAddress: value }),
	setActiveTrip: (trip) => set({ activeTrip: trip }),
	reset: () => set(initialState),
}));
