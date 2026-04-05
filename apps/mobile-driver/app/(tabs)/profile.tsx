import { Text, View } from "react-native";

import { useDriverEligibility } from "../../src/features/driver-profile/hooks/use-driver-eligibility";
import { ErrorState, LoadingState } from "../../src/shared/ui/state-screen";

export default function ProfileTab() {
  const { data, isLoading, isError, error, refetch } = useDriverEligibility(true);

  if (isLoading) {
    return <LoadingState label="Loading profile..." />;
  }

  if (isError) {
    return <ErrorState title="Profile load failed" message={error.message} onRetry={() => void refetch()} />;
  }

  return (
    <View className="flex-1 bg-zinc-950 p-4">
      <Text className="text-2xl font-semibold text-white">Profile</Text>
      <Text className="mt-2 text-zinc-300">Status: {data?.status ?? "UNKNOWN"}</Text>
      <Text className="mt-2 text-zinc-400">Vehicle and route assignment tools are available in onboarding routes.</Text>
    </View>
  );
}
