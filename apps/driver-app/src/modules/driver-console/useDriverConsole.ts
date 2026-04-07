import { useAuth, useUser } from "@clerk/expo";
import { CHANNELS, EVENTS } from "@taxiciti/utils";
import type { RideAcceptedPayload, RideDeclinedPayload, RideStatusPayload, WsAck } from "@taxiciti/utils";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { io, type Socket } from "socket.io-client";
import { ApiError, apiGet, apiPatch, apiPost } from "../../lib/api-client";

export interface DriverRoute {
	id: string;
	name: string;
}

export interface DriverTaxi {
	id: string;
	licensePlate: string;
	make: string;
	model: string;
	capacity: number;
	routes?: {
		id: string;
		route: DriverRoute;
		isActive: boolean;
	}[];
}

export interface DriverProfile {
	id: string;
	firstName: string;
	lastName: string;
	status: string;
	taxis: DriverTaxi[];
}

export interface TripRequest {
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
	user?: {
		firstName: string;
		rating?: number;
	};
}

export interface MapCoordinate {
	latitude: number;
	longitude: number;
}

export interface DriverMapStop {
	id: string;
	coordinate: MapCoordinate;
	type: "pickup" | "dropoff" | "route-stop";
	label: string;
	passengerId?: string;
}

export interface VehicleTrip {
	id: string;
	status: string;
	capacity: number;
	manualPassengers: number;
	passengers: TripRequest[];
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

interface Rank {
	id: string;
	name: string;
	address: string;
	sourceRoutes?: DriverRoute[];
}

interface QueueStatus {
	inQueue: boolean;
	rank?: Rank;
	position?: number;
	queueLength?: number;
	joinedAt?: string;
}

function unwrapAck<T>(response: WsAck<T> | ({ success?: boolean; data?: T; message?: string } & Record<string, unknown>)) {
	if (response?.success) {
		if ("data" in response) {
			if (response.data === undefined) {
				throw new Error("Realtime response did not include data payload");
			}
			return response.data;
		}
		return response as T;
	}
	throw new Error(response?.message ?? "Realtime operation failed");
}

function decodePolyline(encoded: string): MapCoordinate[] {
	const coordinates: MapCoordinate[] = [];
	let index = 0;
	let latitude = 0;
	let longitude = 0;

	while (index < encoded.length) {
		let result = 0;
		let shift = 0;
		let byte: number;
		do {
			byte = (encoded.codePointAt(index) ?? 0) - 63;
			index += 1;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (byte >= 0x20);
		const latitudeChange = (result & 1) === 0 ? result >> 1 : ~(result >> 1);
		latitude += latitudeChange;

		result = 0;
		shift = 0;
		do {
			byte = (encoded.codePointAt(index) ?? 0) - 63;
			index += 1;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (byte >= 0x20);
		const longitudeChange = (result & 1) === 0 ? result >> 1 : ~(result >> 1);
		longitude += longitudeChange;

		coordinates.push({
			latitude: latitude / 1e5,
			longitude: longitude / 1e5,
		});
	}

	return coordinates;
}

function distanceMeters(a: MapCoordinate, b: MapCoordinate) {
	const radius = 6371000;
	const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
	const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
	const lat1 = (a.latitude * Math.PI) / 180;
	const lat2 = (b.latitude * Math.PI) / 180;

	const sinHalfDLat = Math.sin(dLat / 2);
	const sinHalfDLng = Math.sin(dLng / 2);
	const h = sinHalfDLat * sinHalfDLat + Math.cos(lat1) * Math.cos(lat2) * sinHalfDLng * sinHalfDLng;
	return 2 * radius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function useDriverConsole() {
	const { user } = useUser();
	const { getToken, signOut, isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
	const getTokenRef = useRef(getToken);
	const socketRef = useRef<Socket | null>(null);
	const locationWatcherRef = useRef<Location.LocationSubscription | null>(null);
	const lastLocationSyncRef = useRef(0);
	const lastProximityNotificationRef = useRef("");

	const [isLoading, setIsLoading] = useState(true);
	const [driver, setDriver] = useState<DriverProfile | null>(null);
	const [activeVehicleTrip, setActiveVehicleTrip] = useState<VehicleTrip | null>(null);
	const [incomingRequests, setIncomingRequests] = useState<TripRequest[]>([]);
	const [ranks, setRanks] = useState<Rank[]>([]);
	const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; heading?: number; speed?: number } | null>(null);

	const wsUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3006";

	useEffect(() => {
		getTokenRef.current = getToken;
	}, [getToken]);

	const delay = useCallback((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)), []);

	const waitForToken = useCallback(async () => {
		for (let attempt = 0; attempt < 6; attempt += 1) {
			const token = await getTokenRef.current();
			if (token) {
				return token;
			}
			await delay(300);
		}
		return null;
	}, [delay]);

	const emitWithAck = useCallback(
		<T>(eventName: string, payload: unknown) =>
			new Promise<T>((resolve, reject) => {
				const socket = socketRef.current;
				if (!socket?.connected) {
					reject(new Error("Realtime socket is not connected"));
					return;
				}

				socket.emit(eventName, payload, (response: WsAck<T>) => {
					try {
						resolve(unwrapAck<T>(response));
					} catch (error) {
						reject(error);
					}
				});
			}),
		[],
	);

	const fetchDriver = useCallback(async () => {
		if (!user) {
			setDriver(null);
			return;
		}

		const data = await apiGet<DriverProfile>("/api/driver/me");
		setDriver(data);
	}, [user]);

	const fetchActiveTrip = useCallback(async () => {
		if (!user) {
			setActiveVehicleTrip(null);
			return;
		}

		const trips = await apiGet<VehicleTrip[]>("/api/driver/trips/vehicle");
		const active = trips.find((trip) => ["BOARDING", "IN_PROGRESS"].includes(trip.status)) ?? null;
		setActiveVehicleTrip(active);
	}, [user]);

	const fetchRanks = useCallback(async () => {
		try {
			const data = await apiGet<{ ranks?: Rank[] }>("/api/driver/ranks?limit=50");
			setRanks(data.ranks ?? []);
		} catch {
			setRanks([]);
		}
	}, []);

	const syncQueueStatus = useCallback(async () => {
		try {
			const data = await emitWithAck<QueueStatus>(EVENTS.DRIVER_QUEUE_STATUS_SYNC, {});
			setQueueStatus(data);
		} catch {
			setQueueStatus({ inQueue: false });
		}
	}, [emitWithAck]);

	const syncRequests = useCallback(async () => {
		if (!activeVehicleTrip) {
			setIncomingRequests([]);
			return;
		}

		try {
			const requests = await emitWithAck<TripRequest[]>(EVENTS.DRIVER_REQUESTS_SYNC, {});
			setIncomingRequests(requests ?? []);
		} catch {
			setIncomingRequests([]);
		}
	}, [activeVehicleTrip, emitWithAck]);

	const appendIncomingRequest = useCallback((trip: TripRequest) => {
		setIncomingRequests((prev) => {
			if (prev.some((item) => item.id === trip.id)) {
				return prev;
			}
			return [trip, ...prev];
		});
	}, []);

	const removeIncomingRequest = useCallback((requestId: string) => {
		setIncomingRequests((prev) => prev.filter((request) => request.id !== requestId));
	}, []);

	const removePassengerFromActiveTrip = useCallback((requestId: string) => {
		setActiveVehicleTrip((prev) => {
			if (!prev) return null;
			return {
				...prev,
				passengers: prev.passengers.filter((passenger) => passenger.id !== requestId),
			};
		});
	}, []);

	const updatePassengerFromRealtime = useCallback((trip: TripRequest) => {
		setActiveVehicleTrip((prev) => {
			if (!prev) return null;
			return {
				...prev,
				passengers: prev.passengers.map((passenger) => (passenger.id === trip.id ? { ...passenger, ...trip } : passenger)),
			};
		});
	}, []);

	useEffect(() => {
		let canceled = false;

		async function bootstrap() {
			if (!isLoaded) {
				return;
			}

			if (!isSignedIn || !user?.id) {
				setDriver(null);
				setActiveVehicleTrip(null);
				setIncomingRequests([]);
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				const token = await waitForToken();
				if (!token) {
					throw new Error("Auth token is not ready yet");
				}

				for (let attempt = 0; attempt < 3; attempt += 1) {
					try {
						await Promise.all([fetchDriver(), fetchActiveTrip(), fetchRanks()]);
						break;
					} catch (error) {
						const isUnauthorized = error instanceof ApiError && error.status === 401;
						const hasMoreAttempts = attempt < 2;

						if (isUnauthorized && hasMoreAttempts) {
							await delay(500);
							continue;
						}

						throw error;
					}
				}
			} catch (error) {
				if (!canceled) {
					console.error("Failed to bootstrap driver console", error);
				}
			} finally {
				if (!canceled) {
					setIsLoading(false);
				}
			}
		}

		void bootstrap();

		return () => {
			canceled = true;
		};
	}, [delay, fetchDriver, fetchActiveTrip, fetchRanks, isLoaded, isSignedIn, user?.id, waitForToken]);

	useEffect(() => {
		let mounted = true;
		let socket: Socket | null = null;

		async function connectSocket() {
			if (!isLoaded || !isSignedIn || !user?.id) {
				setIsConnected(false);
				return;
			}

			if (socketRef.current) {
				return;
			}

			const token = await waitForToken();
			if (!mounted) {
				return;
			}

			if (!token) {
				setIsConnected(false);
				return;
			}

			socket = io(wsUrl, {
				autoConnect: false,
				auth: { token },
				query: { role: "driver" },
				reconnection: true,
				transports: ["websocket"],
				upgrade: false,
			});

			socket.on("connect", () => setIsConnected(true));
			socket.on("disconnect", () => setIsConnected(false));
			socket.on("connect_error", (error) => {
				console.error("Driver socket connection error", error);
			});

			socket.connect();
			socketRef.current = socket;
		}

		void connectSocket();

		return () => {
			mounted = false;
			if (socket) {
				socket.disconnect();
			}
			socketRef.current = null;
		};
	}, [isLoaded, isSignedIn, user?.id, waitForToken, wsUrl]);

	useEffect(() => {
		const socket = socketRef.current;
		if (!socket || !activeVehicleTrip || !user?.id) {
			return;
		}

		const routeChannel = CHANNELS.ROUTE(activeVehicleTrip.route.id);
		const userChannel = CHANNELS.USER(user.id);

		socket.emit("subscribe", routeChannel);
		socket.emit("subscribe", userChannel);

		const onNewRideRequest = (trip: TripRequest) => {
			appendIncomingRequest(trip);
		};

		const onRideTaken = (payload: { requestId: string; status?: string }) => {
			removeIncomingRequest(payload.requestId);
			removePassengerFromActiveTrip(payload.requestId);
		};

		const onRideStatusChanged = (trip: TripRequest) => {
			removeIncomingRequest(trip.id);
			updatePassengerFromRealtime(trip);
		};

		socket.on(EVENTS.NEW_RIDE_REQUEST, onNewRideRequest);
		socket.on(EVENTS.RIDE_TAKEN, onRideTaken);
		socket.on(EVENTS.RIDE_STATUS_CHANGED, onRideStatusChanged);

		void syncRequests();
		void syncQueueStatus();

		return () => {
			socket.emit("unsubscribe", routeChannel);
			socket.emit("unsubscribe", userChannel);
			socket.off(EVENTS.NEW_RIDE_REQUEST, onNewRideRequest);
			socket.off(EVENTS.RIDE_TAKEN, onRideTaken);
			socket.off(EVENTS.RIDE_STATUS_CHANGED, onRideStatusChanged);
		};
	}, [activeVehicleTrip, appendIncomingRequest, removeIncomingRequest, removePassengerFromActiveTrip, syncQueueStatus, syncRequests, updatePassengerFromRealtime, user?.id]);

	useEffect(() => {
		let mounted = true;

		async function startTracking() {
			if (!activeVehicleTrip || !isConnected || !socketRef.current?.connected) {
				return;
			}

			const permission = await Location.requestForegroundPermissionsAsync();
			if (permission.status !== "granted" || !mounted) {
				return;
			}

			locationWatcherRef.current = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.Balanced,
					timeInterval: 5000,
					distanceInterval: 15,
				},
				(position) => {
					const nextLocation = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
						heading: position.coords.heading ?? undefined,
						speed: position.coords.speed ?? undefined,
					};
					setCurrentLocation(nextLocation);

					const now = Date.now();
					if (now - lastLocationSyncRef.current < 5000) {
						return;
					}

					lastLocationSyncRef.current = now;
					socketRef.current?.emit(EVENTS.DRIVER_LOCATION, {
						taxiId: activeVehicleTrip.taxi.id,
						lat: nextLocation.lat,
						lng: nextLocation.lng,
						heading: nextLocation.heading,
						speed: nextLocation.speed,
					});
				},
			);
		}

		void startTracking();

		return () => {
			mounted = false;
			locationWatcherRef.current?.remove();
			locationWatcherRef.current = null;
		};
	}, [activeVehicleTrip, isConnected]);

	const startShift = useCallback(async (taxiId: string, routeId: string) => {
		try {
			const trip = await apiPost<VehicleTrip>("/api/driver/trips/vehicle", { taxiId, routeId });
			setActiveVehicleTrip(trip);
			setQueueStatus({ inQueue: false });
			setIncomingRequests([]);
		} catch (error) {
			const message = error instanceof ApiError || error instanceof Error ? error.message : "Failed to start shift";
			Alert.alert("Error", message);
		}
	}, []);

	const endShift = useCallback(async () => {
		if (!activeVehicleTrip) return;

		try {
			await apiPatch(`/api/driver/trips/vehicle/${activeVehicleTrip.id}`, { status: "COMPLETED" });
			setActiveVehicleTrip(null);
			setIncomingRequests([]);
		} catch {
			Alert.alert("Error", "Failed to end shift");
		}
	}, [activeVehicleTrip]);

	const acceptRequest = useCallback(
		async (tripId: string) => {
			try {
				const payload: RideAcceptedPayload = { requestId: tripId };
				const acceptedTrip = await emitWithAck<TripRequest>(EVENTS.RIDE_ACCEPTED, payload);
				setIncomingRequests((prev) => prev.filter((request) => request.id !== tripId));
				setActiveVehicleTrip((prev) => {
					if (!prev) return null;
					return {
						...prev,
						passengers: [...prev.passengers, acceptedTrip],
					};
				});
			} catch {
				Alert.alert("Error", "Failed to accept request");
			}
		},
		[emitWithAck],
	);

	const declineRequest = useCallback(
		async (tripId: string) => {
			try {
				const payload: RideDeclinedPayload = { requestId: tripId };
				await emitWithAck(EVENTS.RIDE_DECLINED, payload);
			} catch {
				// Keep optimistic removal behavior.
			} finally {
				setIncomingRequests((prev) => prev.filter((request) => request.id !== tripId));
			}
		},
		[emitWithAck],
	);

	const updatePassengerStatus = useCallback(
		async (tripId: string, status: RideStatusPayload["status"]) => {
			try {
				const payload: RideStatusPayload = { rideId: tripId, status };
				const updatedTrip = await emitWithAck<TripRequest>(EVENTS.RIDE_STATUS_UPDATE, payload);
				setActiveVehicleTrip((prev) => {
					if (!prev) return null;
					return {
						...prev,
						passengers: prev.passengers.map((passenger) => (passenger.id === tripId ? { ...passenger, ...updatedTrip } : passenger)),
					};
				});
			} catch {
				Alert.alert("Error", "Failed to update passenger status");
			}
		},
		[emitWithAck],
	);

	const updateManualPassengers = useCallback(
		async (count: number) => {
			if (!activeVehicleTrip) return;
			try {
				const updated = await apiPatch<{ manualPassengers: number }>(`/api/driver/trips/vehicle/${activeVehicleTrip.id}`, { manualPassengers: count });
				setActiveVehicleTrip((prev) => (prev ? { ...prev, manualPassengers: updated.manualPassengers } : null));
			} catch {
				Alert.alert("Error", "Could not update passenger count");
			}
		},
		[activeVehicleTrip],
	);

	const joinQueue = useCallback(
		async (rankId: string, taxiId: string) => {
			const payload = await emitWithAck<{ position?: number }>(EVENTS.DRIVER_QUEUE_JOIN, { rankId, taxiId });
			await syncQueueStatus();
			return payload.position;
		},
		[emitWithAck, syncQueueStatus],
	);

	const leaveQueue = useCallback(async () => {
		await emitWithAck(EVENTS.DRIVER_QUEUE_LEAVE, {});
		setQueueStatus({ inQueue: false });
	}, [emitWithAck]);

	const sortedPassengers = useMemo(() => {
		if (!activeVehicleTrip) {
			return [];
		}

		const points = activeVehicleTrip.route.popularLocations ?? [];
		const sortIndex = (passenger: TripRequest) => {
			if (passenger.status === "COMPLETED") return Number.MAX_SAFE_INTEGER;
			const targetLat = passenger.status === "IN_PROGRESS" ? passenger.dropoffLat : passenger.pickupLat;
			const targetLng = passenger.status === "IN_PROGRESS" ? passenger.dropoffLng : passenger.pickupLng;
			let best = Number.MAX_SAFE_INTEGER;
			for (const point of points) {
				const distance = Math.hypot(point.lat - targetLat, point.lng - targetLng);
				if (distance < best) {
					best = distance;
				}
			}
			return best;
		};

		return [...activeVehicleTrip.passengers].sort((a, b) => sortIndex(a) - sortIndex(b));
	}, [activeVehicleTrip]);

	const mapRouteCoordinates = useMemo(() => {
		if (!activeVehicleTrip) {
			return [];
		}

		if (activeVehicleTrip.route.polyline) {
			const decoded = decodePolyline(activeVehicleTrip.route.polyline);
			if (decoded.length > 0) {
				return decoded;
			}
		}

		return (activeVehicleTrip.route.popularLocations ?? []).map((point) => ({
			latitude: point.lat,
			longitude: point.lng,
		}));
	}, [activeVehicleTrip]);

	const mapStops = useMemo<DriverMapStop[]>(() => {
		if (!activeVehicleTrip) {
			return [];
		}

		const routeStops = (activeVehicleTrip.route.popularLocations ?? []).map((point) => ({
			id: `route-${point.id}`,
			coordinate: { latitude: point.lat, longitude: point.lng },
			type: "route-stop" as const,
			label: point.name,
		}));

		const passengerStops = activeVehicleTrip.passengers.flatMap((passenger) => {
			const stops: DriverMapStop[] = [];
			if (passenger.status === "ACCEPTED" || passenger.status === "ARRIVED_AT_PICKUP") {
				stops.push({
					id: `${passenger.id}-pickup`,
					coordinate: { latitude: passenger.pickupLat, longitude: passenger.pickupLng },
					type: "pickup",
					label: `Pickup: ${passenger.user?.firstName ?? "Passenger"}`,
					passengerId: passenger.id,
				});
			}

			if (passenger.status !== "COMPLETED") {
				stops.push({
					id: `${passenger.id}-dropoff`,
					coordinate: { latitude: passenger.dropoffLat, longitude: passenger.dropoffLng },
					type: "dropoff",
					label: `Dropoff: ${passenger.user?.firstName ?? "Passenger"}`,
					passengerId: passenger.id,
				});
			}

			return stops;
		});

		return [...routeStops, ...passengerStops];
	}, [activeVehicleTrip]);

	const nextStop = useMemo(() => {
		const nextPassenger = sortedPassengers.find((passenger) => passenger.status !== "COMPLETED");
		if (!nextPassenger) {
			return null;
		}

		if (nextPassenger.status === "IN_PROGRESS") {
			return {
				id: `${nextPassenger.id}-dropoff`,
				coordinate: { latitude: nextPassenger.dropoffLat, longitude: nextPassenger.dropoffLng },
				type: "dropoff" as const,
				label: `Dropoff: ${nextPassenger.user?.firstName ?? "Passenger"}`,
			};
		}

		return {
			id: `${nextPassenger.id}-pickup`,
			coordinate: { latitude: nextPassenger.pickupLat, longitude: nextPassenger.pickupLng },
			type: "pickup" as const,
			label: `Pickup: ${nextPassenger.user?.firstName ?? "Passenger"}`,
		};
	}, [sortedPassengers]);

	const nextStopDistanceMeters = useMemo(() => {
		if (!currentLocation || !nextStop) {
			return null;
		}

		return distanceMeters({ latitude: currentLocation.lat, longitude: currentLocation.lng }, nextStop.coordinate);
	}, [currentLocation, nextStop]);

	useEffect(() => {
		if (!nextStop || !nextStopDistanceMeters) {
			return;
		}

		if (nextStopDistanceMeters < 150 && lastProximityNotificationRef.current !== nextStop.id) {
			lastProximityNotificationRef.current = nextStop.id;
			Alert.alert("Approaching Stop", `You are near ${nextStop.label}.`);
		}
	}, [nextStop, nextStopDistanceMeters]);

	const signOutDriver = useCallback(async () => {
		await signOut();
	}, [signOut]);

	return {
		driver,
		isLoading,
		isConnected,
		activeVehicleTrip,
		incomingRequests,
		sortedPassengers,
		ranks,
		queueStatus,
		currentLocation,
		mapRouteCoordinates,
		mapStops,
		nextStop,
		nextStopDistanceMeters,
		refreshDriver: fetchDriver,
		refreshRequests: syncRequests,
		refreshQueueStatus: syncQueueStatus,
		startShift,
		endShift,
		acceptRequest,
		declineRequest,
		updatePassengerStatus,
		updateManualPassengers,
		joinQueue,
		leaveQueue,
		signOutDriver,
	};
}
