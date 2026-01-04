"use client";

import React, { createContext, useContext, useState } from "react";
import { addToast } from "@heroui/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { iTrip, iRoute, iRank, iTaxi } from "@/types";
import { useMap } from "./MapContext";

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
	requestRide: () => Promise<void>;
	driverArrived: () => Promise<void>;
	startRide: () => Promise<void>;
	completeRide: () => Promise<void>;
	cancelRide: () => void;
	resetRide: () => void;
	shareRide: () => Promise<void>;
	isLoading: boolean;
	isRestoring: boolean;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

// API Fetch Functions
const fetchRoutes = async (): Promise<iRoute[]> => {
	const { data } = await axios.get("/api/routes");
	return data.routes.map((r: any) => ({
		id: r.id,
		name: r.name,
		rankId: r.sourceRankId,
		destinationRankId: r.destRankId,
		estimatedDuration: `${r.estimatedDuration} min`,
		estimatedFare: `R${r.baseFare}`,
		distance: `${r.distance} km`,
		status: r.status.toLowerCase(),
		popularLocations: r.popularLocations
	}));
};

const fetchRanks = async (): Promise<iRank[]> => {
	const { data } = await axios.get("/api/ranks");
	return data.ranks.map((r: any) => ({
		id: r.id,
		name: r.name,
		coordinates: { lat: r.lat, lng: r.lng },
		address: r.address,
		phone: r.phone || "",
		region: r.region
	}));
};

const fetchTaxis = async (): Promise<iTaxi[]> => {
	const { data } = await axios.get("/api/taxis");
	return data.taxis.map((t: any) => ({
		id: t.id,
		driver: t.driver ? (t.driver.fullName || `${t.driver.firstName} ${t.driver.lastName}`) : "Unknown",
		model: t.model,
		licensePlate: t.licensePlate,
		capacity: t.capacity,
		rating: 4.5, // Placeholder
		status: t.status.toLowerCase(),
		location: t.currentLocation ? { lat: t.currentLocation.lat, lng: t.currentLocation.lng } : undefined,
		eta: "5 min", // Placeholder
		routeId: t.routes?.[0]?.routeId,
		phone: t.driver?.phone
	}));
};

const fetchTrips = async (): Promise<iTrip[]> => {
	const { data } = await axios.get("/api/trips");
	return data.map((t: any) => ({
		id: t.id,
		route: t.route?.name || "Unknown Route",
		date: new Date(t.requestTime).toISOString().split('T')[0],
		time: new Date(t.requestTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
		pickup: t.pickupAddress,
		dropoff: t.dropoffAddress,
		driver: t.taxi?.driver ? t.taxi.driver.fullName : "Unknown",
		vehicle: t.taxi?.model || "Unknown",
		licensePlate: t.taxi?.licensePlate || "Unknown",
		fare: `R${t.fare}`,
		status: t.status.toLowerCase(),
		paymentMethod: t.paymentMethod === "QR_CODE" ? "QR Code" : "Cash",
		rating: t.rating?.rating
	}));
};

export function RideProvider({ children }: { children: React.ReactNode }) {
	const queryClient = useQueryClient();
	const { pickupMarker, dropoffMarker } = useMap();

	// State
	const [activeTrip, setActiveTrip] = useState<iTrip | null>(null);
	const [selectedRoute, setSelectedRoute] = useState<iRoute | null>(null);
	const [selectedTaxi, setSelectedTaxi] = useState<iTaxi | null>(null);
	const [pickupLocation, setPickupLocation] = useState<string>("");
	const [dropoffLocation, setDropoffLocation] = useState<string>("");
	const [isRestoring, setIsRestoring] = useState(true);

	// Restore state from local storage
	React.useEffect(() => {
		const restoreState = () => {
			try {
				const storedTrip = localStorage.getItem("activeTrip");
				const storedRoute = localStorage.getItem("selectedRoute");
				const storedTaxi = localStorage.getItem("selectedTaxi");
				const storedPickup = localStorage.getItem("pickupLocation");
				const storedDropoff = localStorage.getItem("dropoffLocation");

				if (storedTrip) setActiveTrip(JSON.parse(storedTrip));
				if (storedRoute) setSelectedRoute(JSON.parse(storedRoute));
				if (storedTaxi) setSelectedTaxi(JSON.parse(storedTaxi));
				if (storedPickup) setPickupLocation(storedPickup);
				if (storedDropoff) setDropoffLocation(storedDropoff);
			} catch (error) {
				console.error("Failed to restore ride state:", error);
			} finally {
				setIsRestoring(false);
			}
		};

		restoreState();
	}, []);

	// Persist state changes
	React.useEffect(() => {
		if (isRestoring) return;
		if (activeTrip) localStorage.setItem("activeTrip", JSON.stringify(activeTrip));
		else localStorage.removeItem("activeTrip");
	}, [activeTrip, isRestoring]);

	React.useEffect(() => {
		if (isRestoring) return;
		if (selectedRoute) localStorage.setItem("selectedRoute", JSON.stringify(selectedRoute));
		else localStorage.removeItem("selectedRoute");
	}, [selectedRoute, isRestoring]);

	React.useEffect(() => {
		if (isRestoring) return;
		if (selectedTaxi) localStorage.setItem("selectedTaxi", JSON.stringify(selectedTaxi));
		else localStorage.removeItem("selectedTaxi");
	}, [selectedTaxi, isRestoring]);

	React.useEffect(() => {
		if (isRestoring) return;
		if (pickupLocation) localStorage.setItem("pickupLocation", pickupLocation);
		else localStorage.removeItem("pickupLocation");
	}, [pickupLocation, isRestoring]);

	React.useEffect(() => {
		if (isRestoring) return;
		if (dropoffLocation) localStorage.setItem("dropoffLocation", dropoffLocation);
		else localStorage.removeItem("dropoffLocation");
	}, [dropoffLocation, isRestoring]);

	// Queries
	const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
		queryKey: ["routes"],
		queryFn: fetchRoutes
	});

	const { data: ranks = [], isLoading: isLoadingRanks } = useQuery({
		queryKey: ["ranks"],
		queryFn: fetchRanks
	});

	const { data: taxis = [], isLoading: isLoadingTaxis } = useQuery({
		queryKey: ["taxis"],
		queryFn: fetchTaxis
	});

	const { data: tripHistory = [], isLoading: isLoadingTrips } = useQuery({
		queryKey: ["trips"],
		queryFn: fetchTrips
	});

	// Mutations
	const createTripMutation = useMutation({
		mutationFn: async (tripData: any) => {
			const { data } = await axios.post("/api/trips", tripData);
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["trips"] });

			// Find the taxi used for this trip
			const taxi = taxis.find(t => t.id === data.taxiId);

			const newTrip: iTrip = {
				id: data.id,
				route: selectedRoute?.name || "Unknown",
				date: new Date(data.requestTime).toISOString().split('T')[0],
				time: new Date(data.requestTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
				pickup: data.pickupAddress,
				dropoff: data.dropoffAddress,
				driver: taxi?.driver || "Unknown",
				vehicle: taxi?.model || "Unknown",
				licensePlate: taxi?.licensePlate || "Unknown",
				fare: `R${data.fare}`,
				status: "requested",
				paymentMethod: "Cash"
			};

			setActiveTrip(newTrip);
			addToast({
				title: "Ride Requested",
				description: `Your taxi (${taxi?.licensePlate}) is on the way!`,
				color: "success",
			});
		},
		onError: (error) => {
			console.error("Error requesting ride:", error);
			addToast({
				title: "Error",
				description: "Failed to request ride. Please try again.",
				color: "danger",
			});
		}
	});

	// Request a new ride
	const requestRide = async () => {
		const isMissingInfo = !selectedRoute || !pickupLocation || !dropoffLocation;

		if (isMissingInfo) {
			console.error("Cannot request ride: missing required information");
			addToast({
				title: "Missing Information",
				description:
					"Please ensure you have selected a route, pickup, and drop-off locations.",
				color: "danger",
			});
			return;
		}

		// Find an available taxi for the selected route
		const availableTaxi = taxis.find((taxi) => {
			const isAvailable = taxi.status === "available";
			const servesRoute = taxi.routeId === selectedRoute.id;
			return isAvailable && servesRoute;
		});

		if (!availableTaxi) {
			console.error("No available taxis for this route");
			addToast({
				title: "No Taxis Available",
				description: "Sorry, there are no available taxis for this route at the moment.",
				color: "danger",
			});
			return;
		}

		// Get rank information
		const rank = ranks.find((r) => r.id === selectedRoute.rankId);

		if (!rank) {
			console.error("Invalid rank information");
			return;
		}

		// Use actual coordinates from map context if available, otherwise fallback to rank/defaults
		const pickupLat = pickupMarker?.lat || rank.coordinates.lat;
		const pickupLng = pickupMarker?.lng || rank.coordinates.lng;

		// For dropoff, if no marker, we might need to geocode the address string or fail
		// For now, if no marker, we'll use the rank coordinates as a fallback but this isn't ideal
		const dropoffLat = dropoffMarker?.lat || rank.coordinates.lat;
		const dropoffLng = dropoffMarker?.lng || rank.coordinates.lng;

		if (!pickupMarker && !rank) {
			addToast({
				title: "Location Error",
				description: "Could not determine pickup coordinates.",
				color: "danger",
			});
			return;
		}

		try {
			await createTripMutation.mutateAsync({
				routeId: selectedRoute.id,
				taxiId: availableTaxi.id,
				rankId: rank.id,
				pickupAddress: pickupLocation,
				pickupLat: pickupLat,
				pickupLng: pickupLng,
				dropoffAddress: dropoffLocation,
				dropoffLat: dropoffLat,
				dropoffLng: dropoffLng,
				fare: parseFloat(selectedRoute.estimatedFare.replace("R", "")),
				paymentMethod: "CASH"
			});
		} catch (error) {
			// Error handling is already done in onError callback of mutation
			console.error("Failed to create trip", error);
		}
	};

	// Update trip status helper
	const updateTripStatus = async (status: string) => {
		if (!activeTrip) return;
		try {
			await axios.patch(`/api/trips/${activeTrip.id}/status`, { status });
		} catch (error) {
			console.error("Failed to update trip status", error);
			addToast({
				title: "Error",
				description: "Failed to update trip status. Please try again.",
				color: "danger",
			});
			throw error;
		}
	};

	// Driver has arrived
	const driverArrived = async () => {
		if (!activeTrip) return;

		try {
			await updateTripStatus("ARRIVED_AT_PICKUP");
			const updatedTrip = { ...activeTrip, status: "driver-arrived" as const };
			setActiveTrip(updatedTrip);

			addToast({
				title: "Driver Arrived",
				description: "Your taxi has arrived at the pickup location.",
				color: "primary",
			});
		} catch (error) {
			// Error handled in helper
		}
	};

	// Start the ride (after QR scan)
	const startRide = async () => {
		if (!activeTrip) return;

		try {
			await updateTripStatus("IN_PROGRESS");
			const updatedTrip = { ...activeTrip, status: "in-progress" as const };
			setActiveTrip(updatedTrip);

			addToast({
				title: "Ride Started",
				description: "You have successfully boarded the taxi.",
				color: "success",
			});
		} catch (error) {
			// Error handled in helper
		}
	};

	// Reset all ride state
	const resetRide = () => {
		setActiveTrip(null);
		setSelectedRoute(null);
		setSelectedTaxi(null);
		setPickupLocation("");
		setDropoffLocation("");
		// LocalStorage is handled by useEffects
	};

	// Cancel the current active ride
	const cancelRide = async () => {
		if (!activeTrip) return;

		try {
			await updateTripStatus("CANCELLED");
			resetRide();
			addToast({
				title: "Ride Cancelled",
				description: "Your ride has been cancelled.",
				color: "default",
			});
		} catch (error) {
			// Error handled in helper
		}
	};

	// Complete the ride (arrived at destination)
	const completeRide = async () => {
		if (!activeTrip) return;

		try {
			await updateTripStatus("COMPLETED");
			const updatedTrip = { ...activeTrip, status: "completed" as const };
			setActiveTrip(updatedTrip);

			// Clear other state, but keep activeTrip for the receipt view
			setSelectedRoute(null);
			setSelectedTaxi(null);
			setPickupLocation("");
			setDropoffLocation("");

			addToast({
				title: "Trip Completed",
				description: "You have arrived at your destination.",
				color: "success",
			});
		} catch (error) {
			// Error handled in helper
		}
	};

	// Share ride details
	const shareRide = async () => {
		if (!activeTrip) return;

		const shareData = {
			title: 'Track my TaxiCity Ride',
			text: `I'm on my way to ${activeTrip.dropoff}. Track my ride here:`,
			url: `${window.location.origin}/ride/track?trip=${activeTrip.id}`
		};

		try {
			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				await navigator.clipboard.writeText(shareData.url);
				addToast({
					title: "Link Copied",
					description: "Tracking link copied to clipboard.",
					color: "success",
				});
			}
		} catch (error) {
			console.error("Error sharing", error);
		}
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
		isLoading: isLoadingRoutes || isLoadingRanks || isLoadingTaxis || isLoadingTrips,
		isRestoring,

		setActiveTrip,
		setSelectedRoute,
		setSelectedTaxi,
		setPickupLocation,
		setDropoffLocation,
		requestRide,
		driverArrived,
		startRide,
		completeRide,
		cancelRide,
		resetRide,
		shareRide,
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
