import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSignUp } from "@clerk/expo";

export default function SignUpScreen() {
	const { signUp } = useSignUp();
	const router = useRouter();
	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const needsEmailVerification = signUp.status === "missing_requirements" && signUp.unverifiedFields.includes("email_address") && signUp.missingFields.length === 0;

	const onSubmit = async () => {
		if (isSubmitting || !emailAddress || !password) {
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			const result = await signUp.password({
				emailAddress,
				password,
			});

			if (result.error) {
				setError(result.error.longMessage ?? "Unable to sign up");
				return;
			}

			await signUp.verifications.sendEmailCode();
			setError("A verification code has been sent to your email.");
		} catch (caughtError: unknown) {
			const message = caughtError instanceof Error ? caughtError.message : "Unable to sign up";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onVerifyCode = async () => {
		if (isSubmitting || !code) {
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			await signUp.verifications.verifyEmailCode({ code });

			if (signUp.status === "complete") {
				await signUp.finalize({
					navigate: ({ session }) => {
						if (session?.currentTask) {
							return;
						}

						router.replace("/(tabs)/dashboard");
					},
				});
				return;
			}

			setError("Verification is incomplete. Please try again.");
		} catch (caughtError: unknown) {
			const message = caughtError instanceof Error ? caughtError.message : "Unable to verify code";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<View className='flex-1 bg-zinc-950 px-6 pt-24'>
			<Text className='text-3xl font-bold text-white'>Create Driver Account</Text>
			<Text className='mt-2 text-zinc-400'>Start your TaxiCiTi onboarding.</Text>

			<View className='mt-8 gap-3'>
				<TextInput value={emailAddress} onChangeText={setEmailAddress} autoCapitalize='none' placeholder='Email' placeholderTextColor='#71717A' className='rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white' />
				<TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder='Password' placeholderTextColor='#71717A' className='rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white' />
				{needsEmailVerification ? <TextInput value={code} onChangeText={setCode} keyboardType='number-pad' placeholder='Verification code' placeholderTextColor='#71717A' className='rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white' /> : null}
			</View>

			{error ? <Text className='mt-3 text-red-400'>{error}</Text> : null}

			<Pressable onPress={onSubmit} disabled={isSubmitting} className='mt-6 items-center rounded-xl bg-yellow-400 px-4 py-3'>
				<Text className='font-semibold text-zinc-900'>{isSubmitting ? "Creating..." : "Create account"}</Text>
			</Pressable>

			{needsEmailVerification ? (
				<Pressable onPress={onVerifyCode} disabled={isSubmitting} className='mt-3 items-center rounded-xl bg-zinc-700 px-4 py-3'>
					<Text className='font-semibold text-white'>{isSubmitting ? "Verifying..." : "Verify code"}</Text>
				</Pressable>
			) : null}

			<Link href='/(auth)/sign-in' className='mt-4 text-center text-zinc-300'>
				Already have an account? Sign in
			</Link>
		</View>
	);
}
