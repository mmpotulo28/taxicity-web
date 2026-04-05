import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useRegisterVehicle } from "../../src/features/onboarding/hooks/use-application";

export default function VehicleRegistrationScreen() {
  const [licensePlate, setLicensePlate] = useState("");
  const [model, setModel] = useState("");
  const registerVehicle = useRegisterVehicle();

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-20">
      <Text className="text-2xl font-bold text-white">Vehicle registration</Text>
      <Text className="mt-2 text-zinc-400">Link your taxi before starting a shift.</Text>

      <View className="mt-8 gap-3">
        <TextInput
          value={licensePlate}
          onChangeText={setLicensePlate}
          placeholder="License plate"
          placeholderTextColor="#71717A"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
        />
        <TextInput
          value={model}
          onChangeText={setModel}
          placeholder="Model"
          placeholderTextColor="#71717A"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
        />
      </View>

      {registerVehicle.isError ? (
        <Text className="mt-3 text-red-400">{registerVehicle.error.message}</Text>
      ) : null}

      <Pressable
        onPress={() => registerVehicle.mutate({ licensePlate, model })}
        disabled={registerVehicle.isPending}
        className="mt-6 items-center rounded-xl bg-yellow-400 px-4 py-3"
      >
        <Text className="font-semibold text-zinc-900">
          {registerVehicle.isPending ? "Saving..." : "Save vehicle"}
        </Text>
      </Pressable>
    </View>
  );
}
