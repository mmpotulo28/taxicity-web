import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function SignUpScreen() {
	const { isLoaded, signUp, setActive } = useSignUp();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const [pendingVerification, setPendingVerification] = useState(false);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSignUp = async () => {
		if (!isLoaded) {
			return;
		}
		setError("");
		setIsSubmitting(true);
		try {
			await signUp.create({
				emailAddress: email.trim(),
				password,
			});
			await signUp.prepareEmailAddressVerification({
				strategy: "email_code",
			});
			setPendingVerification(true);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Unable to sign up.";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleVerify = async () => {
		if (!isLoaded) {
			return;
		}
		setError("");
		setIsSubmitting(true);
		try {
			const complete = await signUp.attemptEmailAddressVerification({
				code: verificationCode.trim(),
			});
			if (complete.status === "complete") {
				await setActive({ session: complete.createdSessionId });
				router.replace("/(tabs)");
				return;
			}
			setError("Verification needs additional steps.");
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Unable to verify code.";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-6 text-2xl font-bold text-white'>Sign Up</Text>
			{pendingVerification ? (
				<>
					<Text className='mb-3 text-neutral-300'>Enter the email verification code.</Text>
					<TextInput
						value={verificationCode}
						onChangeText={setVerificationCode}
						placeholder='Verification code'
						placeholderTextColor='#9ca3af'
						autoCapitalize='none'
						keyboardType='number-pad'
						className='mb-3 rounded-md border border-neutral-700 px-4 py-3 text-white'
					/>
					{error ? <Text className='mb-3 text-sm text-red-400'>{error}</Text> : null}
					<Pressable className='rounded-md bg-brand px-5 py-3' onPress={handleVerify} disabled={isSubmitting}>
						<Text className='text-center font-semibold text-white'>{isSubmitting ? "Verifying..." : "Verify"}</Text>
					</Pressable>
				</>
			) : (
				<>
					<TextInput
						value={email}
						onChangeText={setEmail}
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
					<Pressable className='rounded-md bg-brand px-5 py-3' onPress={handleSignUp} disabled={isSubmitting}>
						<Text className='text-center font-semibold text-white'>{isSubmitting ? "Creating account..." : "Create Account"}</Text>
					</Pressable>
				</>
			)}
			<View className='mt-4 flex-row items-center justify-center gap-1'>
				<Text className='text-neutral-300'>Already have an account?</Text>
				<Link href='/(auth)/sign-in' asChild>
					<Pressable>
						<Text className='font-semibold text-brand'>Sign In</Text>
					</Pressable>
				</Link>
			</View>
		</View>
	);
}
