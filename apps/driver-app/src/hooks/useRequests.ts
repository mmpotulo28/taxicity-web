import { useAuth, useUser } from "@clerk/expo";
import { EVENTS } from "@taxiciti/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { apiGet } from "../lib/api-client";

export interface RequestItem {
	id: string;
	pickupAddress: string;
	dropoffAddress: string;
	status: string;
	fare: number;
	createdAt?: string;
	user?: { firstName?: string };
}

export interface ActiveVehicleTrip {
	id: string;
	status: string;
	route: { id: string; name: string };
	taxi: { licensePlate: string };
	passengers: RequestItem[];
}

export function useRequests() {
	const { user } = useUser();
	const { getToken } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [isConnected, setIsConnected] = useState(false);
	const [activeTrip, setActiveTrip] = useState<ActiveVehicleTrip | null>(null);
	const [incomingRequests, setIncomingRequests] = useState<RequestItem[]>([]);
	const [error, setError] = useState<string | null>(null);

	const wsUrl = process.env.EXPO_PUBLIC_WEBSOCKET_URL || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3006";

	const loadActiveTrip = useCallback(async () => {
		const trips = await apiGet<ActiveVehicleTrip[]>("/api/driver/trips/vehicle");
		const active = trips.find((trip) => ["BOARDING", "IN_PROGRESS"].includes(trip.status)) ?? null;
		setActiveTrip(active);
		return active;
	}, []);

	const syncRequests = useCallback(async (socket: Socket) => {
		const payload = await new Promise<{ success?: boolean; data?: RequestItem[]; message?: string }>((resolve) => {
			socket.emit(EVENTS.DRIVER_REQUESTS_SYNC, {}, (ack: { success?: boolean; data?: RequestItem[]; message?: string }) => {
				resolve(ack);
			});
		});

		if (payload.success) {
			setIncomingRequests(payload.data ?? []);
			setError(null);
			return;
		}

		setIncomingRequests([]);
		if (payload.message) {
			setError(payload.message);
		}
	}, []);

	const refreshRequests = useCallback(async () => {
		setIsLoading(true);
		try {
			const active = await loadActiveTrip();
			if (!active) {
				setIncomingRequests([]);
				setError(null);
				return;
			}

			const token = await getToken();
			const socket = io(wsUrl, {
				autoConnect: false,
				auth: { token: token ?? "" },
				query: { role: "driver" },
			});

			await new Promise<void>((resolve, reject) => {
				socket.once("connect", () => resolve());
				socket.once("connect_error", () => reject(new Error("Realtime connection failed")));
				socket.connect();
			});

			await syncRequests(socket);
			socket.disconnect();
		} catch {
			setError("Realtime connection failed");
		} finally {
			setIsLoading(false);
		}
	}, [getToken, loadActiveTrip, syncRequests, wsUrl]);

	const syncOnConnect = useCallback(
		async (socket: Socket) => {
			try {
				await syncRequests(socket);
			} finally {
				setIsLoading(false);
			}
		},
		[syncRequests],
	);

	useEffect(() => {
		let mounted = true;
		let socket: Socket | null = null;

		async function bootstrap() {
			if (!user?.id) {
				setIsLoading(false);
				return;
			}

			const active = await loadActiveTrip();
			if (!mounted) {
				return;
			}

			if (!active) {
				setIncomingRequests([]);
				setIsLoading(false);
				return;
			}

			const token = await getToken();
			if (!mounted) {
				return;
			}

			socket = io(wsUrl, {
				autoConnect: false,
				auth: { token: token ?? "" },
				query: { role: "driver" },
				reconnection: true,
			});

			socket.on("connect", () => {
				setIsConnected(true);
				if (!socket) {
					setIsLoading(false);
					return;
				}
				void syncOnConnect(socket);
			});

			socket.on("disconnect", () => setIsConnected(false));
			socket.on("connect_error", () => {
				setError("Realtime connection failed");
				setIsLoading(false);
			});
			socket.on(EVENTS.NEW_RIDE_REQUEST, () => {
				if (socket) {
					void syncRequests(socket);
				}
			});
			socket.on(EVENTS.RIDE_TAKEN, () => {
				if (socket) {
					void syncRequests(socket);
				}
			});

			socket.connect();
		}

		void bootstrap();

		return () => {
			mounted = false;
			socket?.disconnect();
		};
	}, [getToken, loadActiveTrip, syncOnConnect, syncRequests, user?.id, wsUrl]);

	const activePassengerCount = useMemo(() => activeTrip?.passengers.length ?? 0, [activeTrip?.passengers.length]);

	return {
		isLoading,
		isConnected,
		activeTrip,
		incomingRequests,
		error,
		activePassengerCount,
		refreshRequests,
	};
}
