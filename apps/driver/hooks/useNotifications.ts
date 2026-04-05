import useSWR from "swr";
import { apiGet } from "@/lib/api-client";

const fetcher = <T>(url: string) => apiGet<T>(url);

export function useNotifications() {
	const { data, error, isLoading, mutate } = useSWR("/api/notifications", fetcher);

	return {
		notifications: data || [],
		isLoading,
		isError: error,
		mutate,
	};
}
