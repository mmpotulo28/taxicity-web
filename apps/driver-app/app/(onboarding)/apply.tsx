import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useSubmitApplication } from "../../src/features/onboarding/hooks/use-application";

export default function ApplyScreen() {
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const submit = useSubmitApplication();

  const onSubmit = async () => {
    await submit.mutateAsync({ licenseNumber, phoneNumber });
  };

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-20">
      <Text className="text-2xl font-bold text-white">Driver application</Text>
      <Text className="mt-2 text-zinc-400">Complete this step to unlock operations.</Text>

      <View className="mt-8 gap-3">
        <TextInput
          value={licenseNumber}
          onChangeText={setLicenseNumber}
          placeholder="License number"
          placeholderTextColor="#71717A"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
        />
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Phone number"
          placeholderTextColor="#71717A"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
        />
      </View>

      {submit.isError ? <Text className="mt-3 text-red-400">{submit.error.message}</Text> : null}

      <Pressable
        onPress={onSubmit}
        disabled={submit.isPending}
        className="mt-6 items-center rounded-xl bg-yellow-400 px-4 py-3"
      >
        <Text className="font-semibold text-zinc-900">
          {submit.isPending ? "Submitting..." : "Submit application"}
        </Text>
      </Pressable>
    </View>
  );
}
