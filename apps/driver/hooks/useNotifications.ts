import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { usePusher } from "@taxiciti/ui";
import { EVENTS } from "@taxiciti/utils";

interface NotificationItem {
	id: string;
	title: string;
	message: string;
	type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "TRIP_UPDATE" | "PAYMENT";
	createdAt: string;
	read: boolean;
}

interface NotificationsSyncAck {
	success: boolean;
	data?: NotificationItem[];
	message?: string;
}

export function useNotifications() {
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { user } = useUser();
	const { pusher, subscribe, unsubscribe } = usePusher();

	const syncNotifications = useCallback(async () => {
		if (!pusher || !user?.id) return;

		const payload = await new Promise<NotificationsSyncAck>((resolve) => {
			pusher.emit(EVENTS.NOTIFICATIONS_SYNC, {}, (ack: NotificationsSyncAck) => {
				resolve(ack);
			});
		});

		if (payload.success) {
			setNotifications(payload.data || []);
			setError(null);
			return;
		}

		setError(payload.message || "Failed to sync notifications");
	}, [pusher, user?.id]);

	const markAsRead = useCallback(
		async (id?: string) => {
			if (!pusher || !user?.id) return;

			const payload = await new Promise<NotificationsSyncAck>((resolve) => {
				pusher.emit(EVENTS.NOTIFICATION_MARK_READ, id ? { id } : {}, (ack: NotificationsSyncAck) => {
					resolve(ack);
				});
			});

			if (payload.success) {
				setNotifications(payload.data || []);
				setError(null);
				return;
			}

			setError(payload.message || "Failed to mark notifications as read");
		},
		[pusher, user?.id],
	);

	useEffect(() => {
		if (!pusher || !user?.id) return;

		setIsLoading(true);
		void syncNotifications().finally(() => setIsLoading(false));

		subscribe("notifications-global", "new-notification", () => {
			void syncNotifications();
		});

		subscribe(`user-${user.id}`, "new-notification", () => {
			void syncNotifications();
		});

		return () => {
			unsubscribe("notifications-global");
			unsubscribe(`user-${user.id}`);
		};
	}, [pusher, subscribe, syncNotifications, unsubscribe, user?.id]);

	const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);

	return {
		notifications,
		isLoading,
		isError: error,
		syncNotifications,
		markAsRead,
		markAllAsRead: () => markAsRead(),
		unreadCount,
	};
}
