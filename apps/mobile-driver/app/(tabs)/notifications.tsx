import { Text, View } from "react-native";

import { EmptyState } from "../../src/shared/ui/state-screen";

export default function NotificationsTab() {
  return (
    <View className="flex-1 bg-zinc-950 p-4">
      <Text className="text-2xl font-semibold text-white">Notifications</Text>
      <EmptyState title="No notifications" message="Realtime notification sync hooks are scaffolded for next slices." />
    </View>
  );
}
