import { ActivityIndicator, Pressable, Text, View } from "react-native";

interface BasicStateProps {
  title?: string;
  message?: string;
}

interface ErrorStateProps extends BasicStateProps {
  onRetry?: () => void;
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-zinc-950">
      <ActivityIndicator size="large" color="#FACC15" />
      <Text className="mt-3 text-zinc-400">{label}</Text>
    </View>
  );
}

export function EmptyState({ title = "Nothing here", message = "No records found." }: BasicStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-zinc-950 px-5">
      <Text className="text-xl font-semibold text-white">{title}</Text>
      <Text className="mt-2 text-center text-zinc-400">{message}</Text>
    </View>
  );
}

export function ErrorState({ title = "Something went wrong", message = "Please try again.", onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-zinc-950 px-5">
      <Text className="text-xl font-semibold text-red-300">{title}</Text>
      <Text className="mt-2 text-center text-zinc-400">{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} className="mt-4 rounded-lg bg-yellow-400 px-4 py-2">
          <Text className="font-semibold text-zinc-900">Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
