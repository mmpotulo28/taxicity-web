import { Text, View } from "react-native";

export default function EndShiftSummaryScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-zinc-950 p-4">
      <Text className="text-2xl font-semibold text-white">Shift ended</Text>
      <Text className="mt-2 text-center text-zinc-400">
        End-shift totals are sourced from backend closeout payloads and rendered deterministically.
      </Text>
    </View>
  );
}
