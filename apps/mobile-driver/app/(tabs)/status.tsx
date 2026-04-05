import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useActiveShift } from "../../src/features/shift/hooks/use-shift";
import { EmptyState, ErrorState, LoadingState } from "../../src/shared/ui/state-screen";

export default function StatusTab() {
  const { shift, isLoading, isError, error, refresh } = useActiveShift();

  if (isLoading) {
    return <LoadingState label="Loading shift status..." />;
  }

  if (isError) {
    return <ErrorState title="Unable to load status" message={error.message} onRetry={refresh} />;
  }

  if (!shift) {
    return (
      <View className="flex-1 bg-zinc-950 p-4">
        <EmptyState title="No active shift" message="Start a shift to receive ride requests." />
        <Link href="/(shift)/start" asChild>
          <Pressable className="mt-4 items-center rounded-lg bg-yellow-400 px-4 py-3">
            <Text className="font-semibold text-zinc-900">Start shift</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-950 p-4">
      <Text className="text-xl font-semibold text-white">Shift status: {shift.status}</Text>
      <Text className="mt-2 text-zinc-400">Taxi: {shift.taxi.licensePlate}</Text>
      <Text className="mt-2 text-zinc-400">Route: {shift.route.name}</Text>
      <Link href="/(shift)/active" className="mt-4 text-yellow-300">
        Open active shift controls
      </Link>
    </View>
  );
}
