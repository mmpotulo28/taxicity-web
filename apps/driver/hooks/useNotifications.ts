import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useNotifications() {
	const { data, error, isLoading, mutate } = useSWR("/api/notifications", fetcher);

	return {
		notifications: data || [],
		isLoading,
		isError: error,
		mutate,
	};
}
