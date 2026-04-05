"use client";

import React, { createContext, useContext, useState } from "react";
import { addToast } from "@heroui/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

import { iTrip, iRoute, iRank, iTaxi, iSavedLocation } from "../types";
import { useMap } from "./MapContext";
import { usePusher } from "./PusherContext";
import { CHANNELS, EVENTS } from "@taxiciti/utils";
import type { RideRequestPayload, RideStatusPayload, WsAck } from "@taxiciti/utils";

interface RouteApiItem {
	id: string;
	name: string;
	sourceRankId: string;
	destRankId: string;
	estimatedDuration: number | string;
	baseFare: number | string;
	distance: number | string;
	status: string;
	polyline?: string;
	popularLocations?: unknown[];
}

interface RankApiItem {
	id: string;
	name: string;
	lat: number;
	lng: number;
	address: string;
	phone?: string;
	region: string;
}

interface TaxiApiItem {
	id: string;
	driver?: {
		fullName?: string;
		firstName?: string;
		lastName?: string;
		phone?: string;
	};
	make?: string;
	model?: string;
	licensePlate: string;
	capacity: number;
	status: string;
	currentLocation?: { lat: number; lng: number };
	routes?: Array<{ routeId?: string }>;
}

interface PassengerApiItem {
	status?: string;
}

interface TripApiItem {
	id: string;
	status?: string;
	requestTime: string;
	pickupAddress: string;
	dropoffAddress: string;
	fare: number | string;
	paymentMethod?: string;
	taxiId?: string;
	rating?: { rating?: number };
	route?: { name?: string };
	taxi?: {
		driver?: {
			fullName?: string;
			firstName?: string;
			lastName?: string;
		};
		make?: string;
		model?: string;
		licensePlate?: string;
	};
	vehicleTrip?: {
		passengers?: PassengerApiItem[];
	};
}

interface RideRequestResponse {
	id: string;
	requestTime: string;
	pickupAddress: string;
	dropoffAddress: string;
	fare: number | string;
	taxiId?: string;
}

type TripSyncPayload = WsAck<TripApiItem[]> | { success?: boolean; trips?: TripApiItem[]; message?: string };

const toRouteStatus = (status: string): iRoute["status"] => {
	const normalized = status.toLowerCase();
	if (normalized === "active" || normalized === "inactive" || normalized === "busy") {
		return normalized;
	}
	return "inactive";
};

const toTaxiStatus = (status: string): iTaxi["status"] => {
	const normalized = status.toLowerCase();
	if (normalized === "available" || normalized === "busy" || normalized === "offline") {
		return normalized;
	}
	return "offline";
};

const toTripStatus = (status: string): iTrip["status"] => {
	if (status === "completed" || status === "cancelled" || status === "in-progress" || status === "requested" || status === "driver-arrived" || status === "accepted") {
		return status;
	}
	return "requested";
};

interface RideContextType {
	tripHistory: iTrip[];
	routes: iRoute[];
	ranks: iRank[];
	taxis: iTaxi[];
	savedLocations: iSavedLocation[];
	isLoadingSavedLocations: boolean;
	isSavingLocation: boolean;
	isDeletingLocation: boolean;
	activeTrip: iTrip | null;
	selectedRoute: iRoute | null;
	selectedTaxi: iTaxi | null;
	pickupLocation: string;
	dropoffLocation: string;
	ratingTrip: iTrip | null;

	// Actions
	setActiveTrip: (trip: iTrip | null) => void;
	setSelectedRoute: (route: iRoute | null) => void;
	setSelectedTaxi: (taxi: iTaxi | null) => void;
	setPickupLocation: (location: string) => void;
	setDropoffLocation: (location: string) => void;
	setRatingTrip: (trip: iTrip | null) => void;
	// Saved Locations
	saveLocation: (location: Omit<iSavedLocation, "id">) => Promise<void>;
	updateSavedLocation: (id: string, location: Partial<iSavedLocation>) => Promise<void>;
	deleteSavedLocation: (id: string) => Promise<void>;
	// Ride Actions
	requestRide: () => Promise<void>;
	driverArrived: () => Promise<void>;
	startRide: () => Promise<void>;
	completeRide: () => Promise<void>;
	cancelRide: () => void;
	resetRide: () => void;
	clearAppData: () => void;
	shareRide: () => Promise<void>;
	isLoading: boolean;
	isRestoring: boolean;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

// API Fetch Functions
const fetchRoutes = async (): Promise<iRoute[]> => {
	const { data } = await apiClient.get("/api/user/routes");
	return (data.routes as RouteApiItem[]).map((r) => ({
		id: r.id,
		name: r.name,
		rankId: r.sourceRankId,
		destinationRankId: r.destRankId,
		estimatedDuration: `${r.estimatedDuration} min`,
		estimatedFare: `R${r.baseFare}`,
		distance: `${r.distance} km`,
		status: toRouteStatus(r.status),
		polyline: r.polyline,
		popularLocations: r.popularLocations as iRoute["popularLocations"],
	}));
};

const fetchRanks = async (): Promise<iRank[]> => {
	const { data } = await apiClient.get("/api/user/ranks");
	return (data.ranks as RankApiItem[]).map((r) => ({
		id: r.id,
		name: r.name,
		coordinates: { lat: r.lat, lng: r.lng },
		address: r.address,
		phone: r.phone || "",
		region: r.region,
	}));
};

const fetchTaxis = async (): Promise<iTaxi[]> => {
	const { data } = await apiClient.get("/api/user/taxis");
	return (data.taxis as TaxiApiItem[]).map((t) => ({
		id: t.id,
		driver: t.driver ? t.driver.fullName || `${t.driver.firstName || ""} ${t.driver.lastName || ""}`.trim() || "Unknown" : "Unknown",
		model: t.make && t.model ? `${t.make} ${t.model}` : t.model || "Unknown Model",
		licensePlate: t.licensePlate,
		capacity: t.capacity,
		rating: 4.5, // Placeholder
		status: toTaxiStatus(t.status),
		location: t.currentLocation ? { lat: t.currentLocation.lat, lng: t.currentLocation.lng } : undefined,
		eta: "5 min", // Placeholder
		routeId: t.routes?.[0]?.routeId,
		phone: t.driver?.phone,
	}));
};

const fetchSavedLocations = async (): Promise<iSavedLocation[]> => {
	const { data } = await apiClient.get("/api/user/users/saved-locations");
	return data;
};

export function RideProvider({ children }: { children: React.ReactNode }) {
	const queryClient = useQueryClient();
	const { pickupMarker, dropoffMarker } = useMap();
	const { subscribe, unsubscribe, pusher } = usePusher();

	// State
	const [activeTrip, setActiveTrip] = useState<iTrip | null>(null);
	const [selectedRoute, setSelectedRoute] = useState<iRoute | null>(null);
	const [selectedTaxi, setSelectedTaxi] = useState<iTaxi | null>(null);
	const [pickupLocation, setPickupLocation] = useState<string>("");
	const [dropoffLocation, setDropoffLocation] = useState<string>("");
	const [ratingTrip, setRatingTrip] = useState<iTrip | null>(null);
	const [isRestoring, setIsRestoring] = useState(true);
	const shouldFetchTaxis = Boolean(selectedRoute || activeTrip);

	const mapTripToUiTrip = React.useCallback((trip: TripApiItem): iTrip => {
		let mappedStatus = trip.status?.toLowerCase?.() || "requested";
		if (mappedStatus === "arrived_at_pickup") mappedStatus = "driver-arrived";
		if (mappedStatus === "in_progress") mappedStatus = "in-progress";

		const passengerCount = trip.vehicleTrip?.passengers?.filter((p) => ["ACCEPTED", "IN_PROGRESS", "COMPLETED"].includes(p.status ?? "")).length || 0;

		return {
			id: trip.id,
			route: trip.route?.name || "Unknown Route",
			date: new Date(trip.requestTime).toISOString().split("T")[0],
			time: new Date(trip.requestTime).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
			pickup: trip.pickupAddress,
			dropoff: trip.dropoffAddress,
			driver: trip.taxi?.driver ? trip.taxi.driver.fullName || `${trip.taxi.driver.firstName} ${trip.taxi.driver.lastName}` : "Pending Assignment",
			vehicle: trip.taxi ? (trip.taxi.make && trip.taxi.model ? `${trip.taxi.make} ${trip.taxi.model}` : trip.taxi.model || "Pending Assignment") : "Pending Assignment",
			licensePlate: trip.taxi?.licensePlate || "Pending Assignment",
			fare: `R${trip.fare}`,
			status: toTripStatus(mappedStatus),
			paymentMethod: trip.paymentMethod === "QR_CODE" ? "QR Code" : "Cash",
			rating: trip.rating?.rating,
			taxiId: trip.taxiId,
			passengerCount,
		};
	}, []);

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
		// Don't persist completed trips to allow for fresh start on reload
		if (activeTrip && activeTrip.status !== "completed") {
			localStorage.setItem("activeTrip", JSON.stringify(activeTrip));
		} else {
			localStorage.removeItem("activeTrip");
		}
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
		queryFn: fetchRoutes,
	});

	const { data: ranks = [], isLoading: isLoadingRanks } = useQuery({
		queryKey: ["ranks"],
		queryFn: fetchRanks,
	});

	const { data: taxis = [] } = useQuery({
		queryKey: ["taxis"],
		queryFn: fetchTaxis,
		enabled: shouldFetchTaxis,
		refetchInterval: shouldFetchTaxis ? 5000 : false, // Poll only while user is in ride-selection/tracking flow
	});

	const { data: tripHistory = [] } = useQuery({
		queryKey: ["trips"],
		queryFn: async () => {
			if (!pusher) {
				return [] as iTrip[];
			}

			const response = await new Promise<TripApiItem[]>((resolve, reject) => {
				pusher.emit(EVENTS.USER_TRIPS_SYNC, {}, (payload: TripSyncPayload) => {
					if (payload?.success) {
						if ("data" in payload) {
							resolve(payload.data ?? []);
							return;
						}

						resolve(payload.trips ?? []);
						return;
					}
					reject(new Error(payload?.message ?? "Failed to sync trips"));
				});
			});

			return response.map(mapTripToUiTrip);
		},
		enabled: Boolean(pusher),
	});

	const { data: savedLocations = [], isLoading: isLoadingSavedLocations } = useQuery({
		queryKey: ["savedLocations"],
		queryFn: fetchSavedLocations,
	});

	const emitWithAck = React.useCallback(
		<TResponse,>(event: string, payload: unknown) =>
			new Promise<TResponse>((resolve, reject) => {
				if (!pusher) {
					reject(new Error("Realtime socket is not connected"));
					return;
				}

				pusher.emit(event, payload, (response: WsAck<TResponse> | ({ success?: boolean; trip?: TResponse; message?: string } & Record<string, unknown>)) => {
					if (response?.success) {
						if ("data" in response) {
							resolve(response.data as TResponse);
							return;
						}

						resolve((response.trip as TResponse) ?? (response as TResponse));
						return;
					}

					reject(new Error(response?.message ?? "Realtime operation failed"));
				});
			}),
		[pusher],
	);

	// Subscribe to Pusher updates for active trip
	React.useEffect(() => {
		if (!activeTrip?.id) return;

		const channelName = CHANNELS.TRIP(activeTrip.id);

		const handleTripUpdate = (updatedTrip: TripApiItem) => {
			const newTripState = mapTripToUiTrip(updatedTrip);

			// Check for changes (ignoring race cons somewhat as Pusher should be latest)
			const statusChanged = newTripState.status !== activeTrip.status;

			setActiveTrip(newTripState);
			queryClient.setQueryData<iTrip[]>(["trips"], (previous = []) => {
				const others = previous.filter((trip) => trip.id !== newTripState.id);
				return [newTripState, ...others];
			});

			if (statusChanged) {
				if (newTripState.status === "accepted") {
					addToast({
						title: "Ride Accepted",
						description: `${newTripState.driver} is on their way!`,
						color: "success",
					});
				} else if (newTripState.status === "driver-arrived") {
					addToast({
						title: "Driver Arrived",
						description: "Your taxi has arrived at the pickup location.",
						color: "primary",
					});
				} else if (newTripState.status === "in-progress") {
					addToast({
						title: "Ride Started",
						description: "You are on your way to the destination.",
						color: "success",
					});
				} else if (newTripState.status === "completed") {
					addToast({
						title: "Ride Completed",
						description: "You have arrived at your destination.",
						color: "success",
					});
					queryClient.invalidateQueries({ queryKey: ["trips"] });
					setRatingTrip(newTripState);
				}
			}
		};

		subscribe(channelName, EVENTS.TRIP_UPDATED, handleTripUpdate);

		return () => unsubscribe(channelName);
	}, [activeTrip?.id, activeTrip?.status, subscribe, unsubscribe, queryClient, mapTripToUiTrip]);

	// Saved Location Mutations
	const saveLocationMutation = useMutation({
		mutationFn: async (location: Omit<iSavedLocation, "id">) => {
			const { data } = await apiClient.post("/api/user/users/saved-locations", location);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["savedLocations"] });
			addToast({ title: "Location Saved", description: "Location saved successfully.", color: "success" });
		},
		onError: () => addToast({ title: "Error", description: "Failed to save location.", color: "danger" }),
	});

	const updateLocationMutation = useMutation({
		mutationFn: async ({ id, location }: { id: string; location: Partial<iSavedLocation> }) => {
			const { data } = await apiClient.put(`/api/user/users/saved-locations/${id}`, location);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["savedLocations"] });
			addToast({ title: "Location Updated", description: "Location updated successfully.", color: "success" });
		},
		onError: () => addToast({ title: "Error", description: "Failed to update location.", color: "danger" }),
	});

	const deleteLocationMutation = useMutation({
		mutationFn: async (id: string) => {
			await apiClient.delete(`/api/user/users/saved-locations/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["savedLocations"] });
			addToast({ title: "Location Deleted", description: "Location removed successfully.", color: "success" });
		},
		onError: () => addToast({ title: "Error", description: "Failed to delete location.", color: "danger" }),
	});

	// Actions wrappers
	const saveLocation = async (location: Omit<iSavedLocation, "id">) => {
		await saveLocationMutation.mutateAsync(location);
	};

	const updateSavedLocation = async (id: string, location: Partial<iSavedLocation>) => {
		await updateLocationMutation.mutateAsync({ id, location });
	};

	const deleteSavedLocation = async (id: string) => {
		await deleteLocationMutation.mutateAsync(id);
	};

	// Request a new ride
	const requestRide = async () => {
		const isMissingInfo = !selectedRoute || !pickupLocation || !dropoffLocation;

		if (isMissingInfo) {
			console.error("Cannot request ride: missing required information");
			addToast({
				title: "Missing Information",
				description: "Please ensure you have selected a route, pickup, and drop-off locations.",
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
			const payload: RideRequestPayload = {
				routeId: selectedRoute.id,
				rankId: rank.id,
				pickupAddress: pickupLocation,
				pickupLat: pickupLat,
				pickupLng: pickupLng,
				dropoffAddress: dropoffLocation,
				dropoffLat: dropoffLat,
				dropoffLng: dropoffLng,
				fare: parseFloat(selectedRoute.estimatedFare.replace("R", "")),
				paymentMethod: "CASH",
			};
			const createdTrip = await emitWithAck<RideRequestResponse>(EVENTS.RIDE_REQUEST, payload);

			queryClient.invalidateQueries({ queryKey: ["trips"] });

			const taxi = createdTrip.taxiId ? taxis.find((t) => t.id === createdTrip.taxiId) : null;
			const newTrip: iTrip = {
				id: createdTrip.id,
				route: selectedRoute.name,
				date: new Date(createdTrip.requestTime).toISOString().split("T")[0],
				time: new Date(createdTrip.requestTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
				pickup: createdTrip.pickupAddress,
				dropoff: createdTrip.dropoffAddress,
				driver: taxi?.driver || "Pending Assignment",
				vehicle: taxi?.model || "Pending Assignment",
				licensePlate: taxi?.licensePlate || "Pending Assignment",
				fare: `R${createdTrip.fare}`,
				status: "requested",
				paymentMethod: "Cash",
				taxiId: createdTrip.taxiId,
			};

			setActiveTrip(newTrip);
			addToast({
				title: "Ride Requested",
				description: "Your request has been sent to nearby drivers.",
				color: "success",
			});
		} catch (error) {
			console.error("Failed to create trip", error);
			addToast({
				title: "Error",
				description: "Failed to request ride. Please try again.",
				color: "danger",
			});
		}
	};

	// Update trip status helper
	const updateTripStatus = async (status: string) => {
		if (!activeTrip) return;
		try {
			const payload: RideStatusPayload = {
				rideId: activeTrip.id,
				status: status as RideStatusPayload["status"],
			};
			await emitWithAck(EVENTS.RIDE_STATUS_UPDATE, payload);
			// Invalidate trips query to update history
			queryClient.invalidateQueries({ queryKey: ["trips"] });
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
		} catch {
			// Error handled in helper
		}
	};

	// Start the ride (after QR scan)
	const startRide = async () => {
		if (!activeTrip) return;

		try {
			console.log("Starting ride for trip:", activeTrip.id);
			await updateTripStatus("IN_PROGRESS");

			// Optimistic update
			const updatedTrip = { ...activeTrip, status: "in-progress" as const };
			setActiveTrip(updatedTrip);

			// Force refetch to ensure backend state is synced
			queryClient.invalidateQueries({ queryKey: ["activeTrip", activeTrip.id] });

			addToast({
				title: "Ride Started",
				description: "You have successfully boarded the taxi.",
				color: "success",
			});
		} catch (error) {
			console.error("Error starting ride:", error);
			addToast({
				title: "Error",
				description: "Failed to start ride. Please try again.",
				color: "danger",
			});
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

	// Clear all app data (Reset App)
	const clearAppData = () => {
		// Clear state
		resetRide();

		// Clear LocalStorage
		localStorage.clear();

		// Clear SessionStorage
		sessionStorage.clear();

		// Reload to ensure fresh state
		window.location.href = "/";
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
		} catch {
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

			// Trigger rating modal - REMOVED strictly to favour the Full Page Details view
			// setRatingTrip(updatedTrip);

			// Clear other state, but keep activeTrip for the receipt view until user dismisses or rates
			setSelectedRoute(null);
			setSelectedTaxi(null);
			setPickupLocation("");
			setDropoffLocation("");

			addToast({
				title: "Trip Completed",
				description: "You have arrived at your destination.",
				color: "success",
			});
		} catch {
			// Error handled in helper
		}
	};

	// Share ride details
	const shareRide = async () => {
		if (!activeTrip) return;

		const shareData = {
			title: "Track my TaxiCity Ride",
			text: `I'm on my way to ${activeTrip.dropoff}. Track my ride here:`,
			url: `${window.location.origin}/ride/track?trip=${activeTrip.id}`,
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
		ratingTrip,
		savedLocations,
		isLoadingSavedLocations,
		isSavingLocation: saveLocationMutation.isPending,
		isDeletingLocation: deleteLocationMutation.isPending,
		isLoading: isLoadingRoutes || isLoadingRanks,
		isRestoring,

		setActiveTrip,
		setSelectedRoute,
		setSelectedTaxi,
		setPickupLocation,
		setDropoffLocation,
		setRatingTrip,
		saveLocation,
		updateSavedLocation,
		deleteSavedLocation,
		requestRide,
		driverArrived,
		startRide,
		completeRide,
		cancelRide,
		resetRide,
		clearAppData,
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

export function useOptionalRide() {
	return useContext(RideContext);
}
