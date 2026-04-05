import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";

export default function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [identifier, setIdentifier] = useState("");
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
      const result = await signIn.create({ identifier, password });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        return;
      }

      setError("Sign-in is incomplete. Complete all steps to continue.");
    } catch (caughtError: unknown) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to sign in";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-24">
      <Text className="text-3xl font-bold text-white">Driver Sign In</Text>
      <Text className="mt-2 text-zinc-400">Access your TaxiCiTi shift operations.</Text>

      <View className="mt-8 gap-3">
        <TextInput
          value={identifier}
          onChangeText={setIdentifier}
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
        <Text className="font-semibold text-zinc-900">{isSubmitting ? "Signing in..." : "Sign in"}</Text>
      </Pressable>

      <Link href="/(auth)/sign-up" className="mt-4 text-center text-zinc-300">
        No account? Create one
      </Link>
    </View>
  );
}
