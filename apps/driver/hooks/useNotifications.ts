import useSWR from "swr";
import { apiGet } from "@/lib/api-client";

interface NotificationItem {
	id: string;
	title: string;
	message: string;
	type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "TRIP_UPDATE" | "PAYMENT";
	createdAt: string;
	read: boolean;
}

const fetcher = <T>(url: string) => apiGet<T>(url);

export function useNotifications() {
	const { data, error, isLoading, mutate } = useSWR<NotificationItem[]>("/api/notifications", fetcher);

	return {
		notifications: data || [],
		isLoading,
		isError: error,
		mutate,
	};
}
