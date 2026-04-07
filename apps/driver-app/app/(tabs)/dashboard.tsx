import { Text, View } from "react-native";

import { useDriverEligibility } from "../../src/features/driver-profile/hooks/use-driver-eligibility";
import { LoadingState } from "../../src/shared/ui/state-screen";

export default function DashboardTab() {
  const { data, isLoading, isError, error } = useDriverEligibility(true);

  if (isLoading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (isError) {
    return <View className="flex-1 items-center justify-center bg-zinc-950"><Text className="text-red-400">{error.message}</Text></View>;
  }

  return (
    <View className="flex-1 bg-zinc-950 p-4">
      <Text className="text-2xl font-semibold text-white">Driver dashboard</Text>
      <Text className="mt-2 text-zinc-400">
        Eligibility: {data?.isEligible ? "Eligible" : "Not eligible"}
      </Text>
      <Text className="mt-2 text-zinc-400">Operational metrics surface in next module slices.</Text>
    </View>
  );
}
