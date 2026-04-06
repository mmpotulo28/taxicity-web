import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";

import { useActiveShift, useEndShift } from "../../src/features/shift/hooks/use-shift";
import { EmptyState, ErrorState, LoadingState } from "../../src/shared/ui/state-screen";
import { startLocationPublishing, stopLocationPublishing } from "../../src/shared/utils/location-publisher";

export default function ActiveShiftScreen() {
  const { shift, isLoading, isError, error, refresh } = useActiveShift();
  const endShift = useEndShift();
  const [locationError, setLocationError] = useState<string | null>(null);
  const activeTaxiId = shift?.taxi.id ?? null;
  const activeShiftId = shift?.id ?? null;

  useEffect(() => {
    if (!activeTaxiId) {
      stopLocationPublishing();
      return;
    }

    let mounted = true;

    const startPublishing = async () => {
      try {
        setLocationError(null);
        await startLocationPublishing(activeTaxiId);
      } catch (caughtError: unknown) {
        if (!mounted) {
          return;
        }

        setLocationError(caughtError instanceof Error ? caughtError.message : "Unable to start location sharing");
      }
    };

    void startPublishing();

    return () => {
      mounted = false;
      stopLocationPublishing();
    };
  }, [activeShiftId, activeTaxiId]);

  if (isLoading) {
    return <LoadingState label="Loading active shift..." />;
  }

  if (isError) {
    return <ErrorState title="Unable to load active shift" message={error.message} onRetry={refresh} />;
  }

  if (!shift) {
    return <EmptyState title="No active shift" message="Start a new shift to access active controls." />;
  }

  const onEndShift = async () => {
    await endShift.mutateAsync(shift.id);
    router.replace("/(shift)/end-summary");
  };

  return (
    <View className="flex-1 bg-zinc-950 p-4">
      <Text className="text-2xl font-semibold text-white">Active shift</Text>
      <Text className="mt-2 text-zinc-300">Status: {shift.status}</Text>
      <Text className="mt-2 text-zinc-400">Taxi: {shift.taxi.licensePlate}</Text>
      <Text className="mt-2 text-zinc-400">Route: {shift.route.name}</Text>
      {locationError ? <Text className="mt-3 text-red-400">Location sharing unavailable: {locationError}</Text> : null}

      <Pressable onPress={onEndShift} disabled={endShift.isPending} className="mt-6 items-center rounded-lg bg-red-500 px-4 py-3">
        <Text className="font-semibold text-white">{endShift.isPending ? "Ending..." : "End shift"}</Text>
      </Pressable>
    </View>
  );
}
