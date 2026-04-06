import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function SignInScreen() {
	const { isLoaded, signIn, setActive } = useSignIn();
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSignIn = async () => {
		if (!isLoaded) {
			return;
		}
		setIsSubmitting(true);
		setError("");
		try {
			const result = await signIn.create({
				identifier: identifier.trim(),
				password,
			});
			if (result.status === "complete") {
				await setActive({ session: result.createdSessionId });
				router.replace("/(tabs)");
				return;
			}
			setError("Sign in needs additional steps.");
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Unable to sign in.";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-6 text-2xl font-bold text-white'>Sign In</Text>
			<TextInput
				value={identifier}
				onChangeText={setIdentifier}
				placeholder='Email'
				placeholderTextColor='#9ca3af'
				autoCapitalize='none'
				keyboardType='email-address'
				className='mb-3 rounded-md border border-neutral-700 px-4 py-3 text-white'
			/>
			<TextInput
				value={password}
				onChangeText={setPassword}
				placeholder='Password'
				placeholderTextColor='#9ca3af'
				secureTextEntry
				className='mb-3 rounded-md border border-neutral-700 px-4 py-3 text-white'
			/>
			{error ? <Text className='mb-3 text-sm text-red-400'>{error}</Text> : null}
			<Pressable className='rounded-md bg-brand px-5 py-3' onPress={handleSignIn} disabled={isSubmitting}>
				<Text className='text-center font-semibold text-white'>{isSubmitting ? "Signing in..." : "Sign In"}</Text>
			</Pressable>
			<View className='mt-4 flex-row items-center justify-center gap-1'>
				<Text className='text-neutral-300'>No account?</Text>
				<Link href='/(auth)/sign-up' asChild>
					<Pressable>
						<Text className='font-semibold text-brand'>Sign Up</Text>
					</Pressable>
				</Link>
			</View>
		</View>
	);
}
