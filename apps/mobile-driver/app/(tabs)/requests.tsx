import { FlatList, Pressable, Text, View } from "react-native";

import { useRequests } from "../../src/features/requests/hooks/use-requests";
import { EmptyState, ErrorState, LoadingState } from "../../src/shared/ui/state-screen";
import type { TripStatus } from "../../src/shared/types/driver";

const NEXT_STATUS_BY_CURRENT: Partial<Record<TripStatus, TripStatus>> = {
  ACCEPTED: "ARRIVED_AT_PICKUP",
  ARRIVED_AT_PICKUP: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED"
};

export default function RequestsTab() {
  const { requests, isLoading, isError, error, refresh, accept, decline, transitionStatus } =
    useRequests();

  if (isLoading) {
    return <LoadingState label="Syncing incoming requests..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load requests"
        message={error.message}
        onRetry={() => void refresh()}
      />
    );
  }

  if (requests.length === 0) {
    return <EmptyState title="No incoming requests" message="New ride requests will appear here." />;
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      className="bg-zinc-950"
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => {
        const nextStatus = NEXT_STATUS_BY_CURRENT[item.status];

        return (
          <View className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <Text className="text-base font-semibold text-white">{item.pickupAddress}</Text>
            <Text className="mt-1 text-zinc-400">Drop-off: {item.dropoffAddress}</Text>
            <Text className="mt-1 text-zinc-300">Fare: R{item.fare.toFixed(2)}</Text>
            <Text className="mt-1 text-zinc-400">Status: {item.status}</Text>
            <View className="mt-4 flex-row gap-2">
              {item.status === "REQUESTED" ? (
                <>
                  <Pressable
                    onPress={() => void accept(item.id)}
                    className="flex-1 items-center rounded-lg bg-emerald-500 px-3 py-2"
                  >
                    <Text className="font-semibold text-zinc-950">Accept</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void decline(item.id)}
                    className="flex-1 items-center rounded-lg bg-zinc-700 px-3 py-2"
                  >
                    <Text className="font-semibold text-white">Decline</Text>
                  </Pressable>
                </>
              ) : nextStatus ? (
                <Pressable
                  onPress={() => void transitionStatus(item.id, nextStatus)}
                  className="flex-1 items-center rounded-lg bg-yellow-400 px-3 py-2"
                >
                  <Text className="font-semibold text-zinc-900">Set {nextStatus}</Text>
                </Pressable>
              ) : (
                <View className="flex-1 items-center rounded-lg bg-zinc-800 px-3 py-2">
                  <Text className="font-semibold text-zinc-300">No actions</Text>
                </View>
              )}
            </View>
          </View>
        );
      }}
    />
  );
}
