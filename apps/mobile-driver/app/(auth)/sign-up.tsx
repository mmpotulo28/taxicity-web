import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!isLoaded || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signUp.create({ emailAddress, password });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        return;
      }

      setError("Account created, but verification is still required.");
    } catch (caughtError: unknown) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to sign up";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-24">
      <Text className="text-3xl font-bold text-white">Create Driver Account</Text>
      <Text className="mt-2 text-zinc-400">Start your TaxiCiTi onboarding.</Text>

      <View className="mt-8 gap-3">
        <TextInput
          value={emailAddress}
          onChangeText={setEmailAddress}
          autoCapitalize="none"
          placeholder="Email"
          placeholderTextColor="#71717A"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#71717A"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
        />
      </View>

      {error ? <Text className="mt-3 text-red-400">{error}</Text> : null}

      <Pressable
        onPress={onSubmit}
        disabled={isSubmitting}
        className="mt-6 items-center rounded-xl bg-yellow-400 px-4 py-3"
      >
        <Text className="font-semibold text-zinc-900">{isSubmitting ? "Creating..." : "Create account"}</Text>
      </Pressable>

      <Link href="/(auth)/sign-in" className="mt-4 text-center text-zinc-300">
        Already have an account? Sign in
      </Link>
    </View>
  );
}
