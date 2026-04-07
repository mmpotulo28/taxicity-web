import { useAuth, useUser } from "@clerk/expo";
import { CHANNELS, EVENTS } from "@taxiciti/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";

export interface DriverNotification {
	id: string;
	title: string;
	message: string;
	type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "TRIP_UPDATE" | "PAYMENT";
	createdAt: string;
	read: boolean;
}

interface NotificationsAck {
	success: boolean;
	data?: DriverNotification[];
	message?: string;
}

export function useDriverNotifications() {
	const { user } = useUser();
	const { getToken } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [isConnected, setIsConnected] = useState(false);
	const [notifications, setNotifications] = useState<DriverNotification[]>([]);
	const [error, setError] = useState<string | null>(null);

	const wsUrl = process.env.EXPO_PUBLIC_WEBSOCKET_URL || process.env.EXPO_PUBLIC_API_URL || "http://localhost:3006";
	const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

	const syncNotifications = useCallback(async (socket: Socket) => {
		const payload = await new Promise<NotificationsAck>((resolve) => {
			socket.emit(EVENTS.NOTIFICATIONS_SYNC, {}, (ack: NotificationsAck) => {
				resolve(ack);
			});
		});

		if (payload.success) {
			setNotifications(payload.data ?? []);
			setError(null);
			return;
		}

		setError(payload.message ?? "Failed to sync notifications");
	}, []);

	const markAsRead = useCallback(async (socket: Socket, id?: string) => {
		const payload = await new Promise<NotificationsAck>((resolve) => {
			socket.emit(EVENTS.NOTIFICATION_MARK_READ, id ? { id } : {}, (ack: NotificationsAck) => {
				resolve(ack);
			});
		});

		if (payload.success) {
			setNotifications(payload.data ?? []);
			setError(null);
			return;
		}

		setError(payload.message ?? "Failed to update notifications");
	}, []);

	const runWithSocket = useCallback(
		async (task: (socket: Socket) => Promise<void>) => {
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

			try {
				await task(socket);
			} finally {
				socket.disconnect();
			}
		},
		[getToken, wsUrl],
	);

	const refreshNotifications = useCallback(async () => {
		try {
			await runWithSocket(async (socket) => {
				await syncNotifications(socket);
			});
		} catch {
			setError("Realtime connection failed");
		}
	}, [runWithSocket, syncNotifications]);

	const markSingleNotificationAsRead = useCallback(
		async (notificationId: string) => {
			try {
				await runWithSocket(async (socket) => {
					await markAsRead(socket, notificationId);
				});
			} catch {
				setError("Realtime connection failed");
			}
		},
		[markAsRead, runWithSocket],
	);

	const markAllNotificationsAsRead = useCallback(async () => {
		try {
			await runWithSocket(async (socket) => {
				await markAsRead(socket);
			});
		} catch {
			setError("Realtime connection failed");
		}
	}, [markAsRead, runWithSocket]);

	const syncOnConnect = useCallback(
		async (socket: Socket) => {
			try {
				await syncNotifications(socket);
			} finally {
				setIsLoading(false);
			}
		},
		[syncNotifications],
	);

	useEffect(() => {
		let mounted = true;
		let socket: Socket | null = null;

		async function connect() {
			if (!user?.id) {
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
				socket?.emit("subscribe", CHANNELS.USER(user.id));
				socket?.emit("subscribe", "notifications-global");
				if (socket) {
					void syncOnConnect(socket);
				} else {
					setIsLoading(false);
				}
			});

			socket.on("disconnect", () => setIsConnected(false));
			socket.on("connect_error", () => {
				setError("Realtime connection failed");
				setIsLoading(false);
			});
			socket.on("new-notification", () => {
				if (socket) {
					void syncNotifications(socket);
				}
			});

			socket.connect();
		}

		void connect();

		return () => {
			mounted = false;
			if (socket && user?.id) {
				socket.emit("unsubscribe", CHANNELS.USER(user.id));
				socket.emit("unsubscribe", "notifications-global");
				socket.disconnect();
			}
		};
	}, [getToken, syncNotifications, syncOnConnect, user?.id, wsUrl]);

	return {
		isLoading,
		isConnected,
		notifications,
		error,
		unreadCount,
		refreshNotifications,
		markSingleNotificationAsRead,
		markAllNotificationsAsRead,
	};
}
