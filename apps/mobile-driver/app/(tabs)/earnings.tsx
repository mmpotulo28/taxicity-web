import { Text, View } from "react-native";

import { EmptyState } from "../../src/shared/ui/state-screen";

export default function EarningsTab() {
  return (
    <View className="flex-1 bg-zinc-950 p-4">
      <Text className="text-2xl font-semibold text-white">Earnings</Text>
      <EmptyState title="No earnings yet" message="Earnings metrics and pagination are pending backend adapter validation." />
    </View>
  );
}
