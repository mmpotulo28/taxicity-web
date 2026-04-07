import { useEffect } from "react";
import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import * as Linking from "expo-linking";

export default function AuthCallbackScreen() {
  useEffect(() => {
    void Linking.getInitialURL();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-zinc-950 px-5">
      <Text className="text-zinc-200">Finalizing authentication...</Text>
      <Redirect href="/(tabs)/dashboard" />
    </View>
  );
}
