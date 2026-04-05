import useSWR from "swr";
import { apiGet } from "../lib/api-client";

export interface Notification {
	id: string;
	title: string;
	message: string;
	type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "TRIP_UPDATE" | "PAYMENT";
	userId: string;
	createdAt: string;
	isRead: boolean;
}

const fetcher = (url: string) => apiGet<Notification[]>(url);

export function useNotifications() {
	const { data, error, isLoading, mutate } = useSWR("/api/notifications", fetcher);

	return {
		notifications: data || [],
		isLoading,
		isError: error,
		mutate,
	};
}
