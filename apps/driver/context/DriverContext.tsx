"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { addToast } from "@heroui/toast";
import { usePusher } from "@taxiciti/ui";
import { useDriverLocation } from "../hooks/useDriverLocation";
import { CHANNELS, EVENTS, logger } from "@taxiciti/utils";
import type { RideAcceptedPayload, RideStatusPayload, WsAck } from "@taxiciti/utils";
import { apiGet, apiPatch, apiPost, ApiError, setApiTokenResolver } from "@/lib/api-client";

export interface Driver {
	id: string;
	firstName: string;
	lastName: string;
	status: string;
	taxis: {
		id: string;
		licensePlate: string;
		make: string;
		model: string;
		year: number;
		color: string;
		capacity: number;
		status: string;
		registrationDoc?: string;
		insuranceDoc?: string;
		permitDoc?: string;
		routes?: {
			id: string;
			route: {
				id: string;
				name: string;
			};
			isActive: boolean;
		}[];
	}[];
}

export interface Trip {
	id: string;
	pickupAddress: string;
	pickupLat: number;
	pickupLng: number;
	dropoffAddress: string;
	dropoffLat: number;
	dropoffLng: number;
	fare: number;
	status: string;
	paymentMethod: "CASH" | "QR_CODE" | "MOBILE_MONEY";
	distance?: string;
	user?: {
		firstName: string;
		rating?: number;
	};
}

export interface VehicleTrip {
	id: string;
	status: string;
	capacity: number;
	manualPassengers: number;
	passengers: Trip[];
	route: {
		id: string;
		name: string;
		baseFare: number;
		polyline?: string;
		popularLocations?: {
			id: string;
			lat: number;
			lng: number;
			name: string;
		}[];
	};
	taxi: {
		id: string;
		licensePlate: string;
	};
}

interface DriverContextType {
	driver: Driver | null;
	isOnline: boolean;
	activeVehicleTrip: VehicleTrip | null;
	incomingRequests: Trip[];
	isLoading: boolean;
	currentLocation: { lat: number; lng: number; heading?: number; speed?: number } | null;
	toggleOnline: () => Promise<void>;
	startShift: (taxiId: string, routeId: string) => Promise<void>;
	endShift: () => Promise<void>;
	acceptRequest: (tripId: string) => Promise<void>;
	declineRequest: (tripId: string) => void;
	updatePassengerStatus: (tripId: string, status: string) => Promise<void>;
	updateManualPassengers: (count: number) => Promise<void>;
	refreshRequests: () => Promise<void>;
	refreshDriver: () => Promise<void>;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export const DriverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { user, isLoaded } = useUser();
	const { getToken, isLoaded: isAuthLoaded, userId } = useAuth();
	const { subscribe, unsubscribe, pusher } = usePusher();
	const [driver, setDriver] = useState<Driver | null>(null);
	const [isOnline, setIsOnline] = useState(false);
	const [activeVehicleTrip, setActiveVehicleTrip] = useState<VehicleTrip | null>(null);
	const [incomingRequests, setIncomingRequests] = useState<Trip[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const { location: trackedLocation, startTracking, stopTracking, isTracking } = useDriverLocation();
	const lastLocationSync = React.useRef<number>(0);

	const currentLocation = trackedLocation
		? {
				lat: trackedLocation.latitude,
				lng: trackedLocation.longitude,
				heading: trackedLocation.heading ?? undefined,
				speed: trackedLocation.speed ?? undefined,
			}
		: null;

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

	useEffect(() => {
		setApiTokenResolver(async () => {
			const token = await getToken();
			return token ?? null;
		});

		return () => {
			setApiTokenResolver(null);
		};
	}, [getToken]);

	const getAuthHeaders = React.useCallback(async (): Promise<HeadersInit | undefined> => {
		const token = await getToken();
		if (!token) {
			return undefined;
		}

		return {
			Authorization: `Bearer ${token}`,
		};
	}, [getToken]);

	const syncRequestsViaSocket = React.useCallback(async () => {
		if (!activeVehicleTrip || !driver || !pusher) {
			setIncomingRequests([]);
			return;
		}

		const response = await new Promise<Trip[]>((resolve, reject) => {
			pusher.emit(EVENTS.DRIVER_REQUESTS_SYNC, {}, (payload: WsAck<Trip[]> | { success?: boolean; requests?: Trip[]; message?: string }) => {
				if (payload?.success) {
					if ("data" in payload) {
						resolve(payload.data ?? []);
						return;
					}

					resolve(payload.requests ?? []);
					return;
				}

				reject(new Error(payload?.message ?? "Failed to sync requests"));
			});
		});

		setIncomingRequests(response);
	}, [activeVehicleTrip, driver, pusher]);

	// Sync location to API (Throttled to 5s)
	useEffect(() => {
		// Need trackedLocation, active trip, and Pusher socket connection
		if (!trackedLocation || !activeVehicleTrip || !driver || !pusher) return;

		const now = Date.now();
		if (now - lastLocationSync.current < 5000) return;

		logger.info(`Syncing location via WebSocket... ${JSON.stringify(trackedLocation)}`);

		// Emit directly to WebSocket instead of HTTP
		pusher.emit(EVENTS.DRIVER_LOCATION, {
			taxiId: activeVehicleTrip.taxi.id,
			lat: trackedLocation.latitude,
			lng: trackedLocation.longitude,
			heading: trackedLocation.heading,
			speed: trackedLocation.speed,
		});

		// Fallback? No, we trust the socket.
		// If we wanted persistence, we could call HTTP API every 60s or on events.

		lastLocationSync.current = now;
	}, [trackedLocation, activeVehicleTrip, driver, pusher]);

	// Watch position when active
	useEffect(() => {
		if (activeVehicleTrip && !isTracking && driver) {
			console.log("DriverContext: Starting location tracking...");
			startTracking();
		} else if (!activeVehicleTrip && isTracking && driver) {
			console.log("DriverContext: Stopping location tracking...");
			stopTracking();
		}
	}, [activeVehicleTrip, isTracking, startTracking, stopTracking, driver]);

	const fetchDriver = React.useCallback(async () => {
		if (!user) return;
		try {
			setIsLoading(true);
			console.log("DriverContext: Fetching driver profile...");
			const headers = await getAuthHeaders();
			if (!headers) {
				console.warn("DriverContext: No auth token available yet for /api/driver/me");
				return;
			}

			const data = await apiGet<Driver>("/api/driver/me", { headers });
			console.log("DriverContext: Driver profile fetched successfully.");
			setDriver(data);
		} catch (error) {
			console.error("Failed to fetch driver:", error);
		} finally {
			setIsLoading(false);
		}
	}, [getAuthHeaders, user]);

	const fetchActiveVehicleTrip = React.useCallback(async () => {
		if (!driver) return;
		try {
			console.log("DriverContext: Fetching active vehicle trip...");
			const headers = await getAuthHeaders();
			if (!headers) {
				console.warn("DriverContext: No auth token available yet for /api/driver/trips/vehicle");
				return;
			}

			const trips = await apiGet<VehicleTrip[]>("/api/driver/trips/vehicle", { headers });
			// Assuming we only handle one active trip at a time for now
			const active = trips.find((t: VehicleTrip) => ["BOARDING", "IN_PROGRESS"].includes(t.status));
			setActiveVehicleTrip(active || null);
			if (active) setIsOnline(true);
		} catch (error) {
			console.error("Failed to fetch active vehicle trip:", error);
		}
	}, [driver, getAuthHeaders]);

	// Fetch driver profile
	useEffect(() => {
		if (!isLoaded || !isAuthLoaded || !user || !userId) return;
		console.log("DriverContext: Loading driver profile...");
		fetchDriver();
	}, [isAuthLoaded, isLoaded, user, userId, fetchDriver]);

	// Fetch active vehicle trip when driver is loaded
	useEffect(() => {
		if (driver) {
			console.log("DriverContext: Loading active vehicle trip...");
			fetchActiveVehicleTrip();
		}
	}, [driver, fetchActiveVehicleTrip]);

	// Subscribe to Pusher updates for real-time requests and trips
	useEffect(() => {
		if (!activeVehicleTrip || !driver) return;

		const channelName = CHANNELS.ROUTE(activeVehicleTrip.route.id);

		console.log(`DriverContext: Subscribing to ${channelName}`);

		subscribe(channelName, EVENTS.NEW_RIDE_REQUEST, (newTrip: Trip) => {
			console.log("DriverContext: New trip EVENT received:", newTrip);
			setIncomingRequests((prev) => {
				const exists = prev.find((t) => t.id === newTrip.id);
				if (exists) return prev;
				return [newTrip, ...prev];
			});
		});

		subscribe(channelName, EVENTS.RIDE_TAKEN, (data: { requestId: string; driverId: string | null; status?: string }) => {
			console.log("Trip cancelled/taken:", data.requestId);

			// Update Incoming Requests
			setIncomingRequests((prev) => prev.filter((r) => r.id !== data.requestId));

			// Update Active Manifest (if the passenger was already accepted)
			setActiveVehicleTrip((prev) => {
				if (!prev) return null;
				// Check if the passenger is in the current manifest
				const isPassenger = prev.passengers.some((p) => p.id === data.requestId);

				if (isPassenger) {
					if (data.status === "CANCELLED") {
						return {
							...prev,
							passengers: prev.passengers.map((p) => (p.id === data.requestId ? { ...p, status: "CANCELLED" } : p)),
						};
					}

					return {
						...prev,
						passengers: prev.passengers.filter((p) => p.id !== data.requestId),
					};
				}
				return prev;
			});

			addToast({
				title: data.status === "CANCELLED" ? "Trip Cancelled" : "Request Taken",
				description: data.status === "CANCELLED" ? "Passenger cancelled the request." : "Another driver has accepted this request.",
				color: "default",
			});
		});

		return () => {
			pusher?.emit("unsubscribe", channelName);
			unsubscribe(channelName);
		};
	}, [activeVehicleTrip, driver, subscribe, unsubscribe, pusher]);

	useEffect(() => {
		if (!driver || !user || !pusher) return;

		const userChannel = CHANNELS.USER(user.id);

		subscribe(userChannel, EVENTS.RIDE_STATUS_CHANGED, (updatedTrip: Trip) => {
			setIncomingRequests((prev) => prev.filter((request) => request.id !== updatedTrip.id));

			setActiveVehicleTrip((prev) => {
				if (!prev) return null;

				const hasPassenger = prev.passengers.some((passenger) => passenger.id === updatedTrip.id);
				if (!hasPassenger) {
					return prev;
				}

				return {
					...prev,
					passengers: prev.passengers.map((passenger) => (passenger.id === updatedTrip.id ? { ...passenger, ...updatedTrip } : passenger)),
				};
			});

			if (updatedTrip.status === "CANCELLED") {
				addToast({
					title: "Passenger Cancelled",
					description: "Trip status updated to cancelled.",
					color: "warning",
				});
			}
		});

		return () => {
			pusher.emit("unsubscribe", userChannel);
			unsubscribe(userChannel);
		};
	}, [driver, user, pusher, subscribe, unsubscribe]);

	// Initial fetch for requests when active via websocket ack sync.
	useEffect(() => {
		if (!activeVehicleTrip || !driver || !pusher) {
			setIncomingRequests([]);
			return;
		}

		syncRequestsViaSocket().catch((error) => {
			console.error("Failed to sync requests:", error);
		});
	}, [activeVehicleTrip, activeVehicleTrip?.id, driver, pusher, syncRequestsViaSocket]);

	const toggleOnline = async () => {
		// This is now mostly controlled by start/end shift
		// But we can keep it for "Break" mode if needed
		setIsOnline(!isOnline);
	};

	const startShift = async (taxiId: string, routeId: string) => {
		try {
			console.log(`DriverContext: Starting shift with taxiId=${taxiId} and routeId=${routeId}`);
			const trip = await apiPost<VehicleTrip>("/api/driver/trips/vehicle", {
				taxiId,
				routeId,
			});

			setActiveVehicleTrip(trip);
			setIsOnline(true);
			addToast({
				title: "Shift Started",
				description: "You are now active on the route.",
				color: "success",
			});
		} catch (error) {
			const message = error instanceof ApiError || error instanceof Error ? error.message : "Failed to start shift";
			addToast({
				title: "Error",
				description: message,
				color: "danger",
			});
			throw error;
		}
	};

	const endShift = async () => {
		if (!activeVehicleTrip) return;
		try {
			await apiPatch(`/api/driver/trips/vehicle/${activeVehicleTrip.id}`, {
				status: "COMPLETED",
			});

			setActiveVehicleTrip(null);
			setIsOnline(false);
			addToast({
				title: "Shift Ended",
				description: "Your run has been completed.",
				color: "success",
			});
		} catch (error) {
			console.error("Failed to end shift:", error);
		}
	};

	const acceptRequest = async (tripId: string) => {
		if (!activeVehicleTrip) return;

		// Find the request to get user info
		const request = incomingRequests.find((r) => r.id === tripId);

		try {
			const payload: RideAcceptedPayload = {
				requestId: tripId,
			};
			const trip = await emitWithAck<Trip>(EVENTS.RIDE_ACCEPTED, payload);

			// Update local state
			setActiveVehicleTrip((prev) => {
				if (!prev) return null;
				// Merge user info from request if available
				const tripWithUser = request?.user ? { ...trip, user: request.user } : trip;
				return {
					...prev,
					passengers: [...prev.passengers, tripWithUser],
				};
			});
			setIncomingRequests((prev) => prev.filter((r) => r.id !== tripId));
			addToast({
				title: "Passenger Accepted",
				description: "Passenger added to manifest.",
				color: "success",
			});
		} catch (error) {
			console.error("Failed to accept trip:", error);
			addToast({
				title: "Error",
				description: "An unexpected error occurred",
				color: "danger",
			});
		}
	};

	const declineRequest = (tripId: string) => {
		setIncomingRequests((prev) => prev.filter((r) => r.id !== tripId));
	};

	const updatePassengerStatus = async (tripId: string, status: string) => {
		try {
			const payload: RideStatusPayload = {
				rideId: tripId,
				status: status as RideStatusPayload["status"],
			};
			const updatedTrip = await emitWithAck<Trip>(EVENTS.RIDE_STATUS_UPDATE, payload);

			// Update local state
			setActiveVehicleTrip((prev) => {
				if (!prev) return null;
				return {
					...prev,
					passengers: prev.passengers.map((p) => (p.id === tripId ? { ...p, ...updatedTrip } : p)),
				};
			});
		} catch (error) {
			console.error("Failed to update passenger status:", error);
		}
	};

	const updateManualPassengers = async (count: number) => {
		if (!activeVehicleTrip) return;
		try {
			const updatedTrip = await apiPatch<{ manualPassengers: number }>(`/api/driver/trips/vehicle/${activeVehicleTrip.id}`, {
				manualPassengers: count,
			});

			setActiveVehicleTrip((prev) => (prev ? { ...prev, manualPassengers: updatedTrip.manualPassengers } : null));
		} catch (error) {
			console.error("Failed to update manual passengers:", error);
			addToast({
				title: "Error",
				description: "Could not update passenger count.",
				color: "danger",
			});
		}
	};

	const refreshRequests = async () => {
		await syncRequestsViaSocket();
	};

	return (
		<DriverContext.Provider
			value={{
				driver,
				isOnline,
				activeVehicleTrip,
				incomingRequests,
				isLoading,
				currentLocation,
				toggleOnline,
				startShift,
				endShift,
				acceptRequest,
				declineRequest,
				updatePassengerStatus,
				updateManualPassengers,
				refreshRequests,
				refreshDriver: fetchDriver,
			}}>
			{children}
		</DriverContext.Provider>
	);
};

export const useDriver = () => {
	const context = useContext(DriverContext);
	if (context === undefined) {
		throw new Error("useDriver must be used within a DriverProvider");
	}
	return context;
};
