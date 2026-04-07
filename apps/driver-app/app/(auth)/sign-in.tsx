import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSignIn } from "@clerk/expo";
import { logger } from "@/src/core/telemetry/logger";

type SupportedSecondFactorStrategy = "email_code" | "phone_code";

export default function SignInScreen() {
	const { signIn } = useSignIn();
	const router = useRouter();
	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");
	const [secondFactorCode, setSecondFactorCode] = useState("");
	const [secondFactorStrategy, setSecondFactorStrategy] = useState<SupportedSecondFactorStrategy | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const finalizeSignIn = async () => {
		logger.info("Sign-in successful, finalizing session", { emailAddress });
		await signIn.finalize({
			navigate: ({ session }) => {
				if (session?.currentTask) {
					logger.warn("Session has current task", {
						emailAddress,
						taskKey: session.currentTask.key,
					});
					return;
				}
				router.replace("/(tabs)/dashboard");
			},
		});
	};

	const getSupportedSecondFactorStrategy = (): SupportedSecondFactorStrategy | null => {
		const supported = (signIn.supportedSecondFactors ?? []).map((factor) => factor.strategy);
		if (supported.includes("email_code")) {
			return "email_code";
		}
		if (supported.includes("phone_code")) {
			return "phone_code";
		}
		return null;
	};

	const initiateSecondFactor = async () => {
		const strategy = getSupportedSecondFactorStrategy();

		if (!strategy) {
			setError("Second-factor verification is required, but no email or phone code factor is available.");
			return;
		}

		setSecondFactorStrategy(strategy);

		if (strategy === "email_code") {
			const sendResult = await signIn.mfa.sendEmailCode();
			if (sendResult.error) {
				setError(sendResult.error.longMessage ?? "Unable to send verification code.");
				return;
			}
			setInfo("We sent a verification code to your email. Enter it to continue.");
			return;
		}

		const sendResult = await signIn.mfa.sendPhoneCode();
		if (sendResult.error) {
			setError(sendResult.error.longMessage ?? "Unable to send verification code.");
			return;
		}
		setInfo("We sent a verification code to your phone. Enter it to continue.");
	};

	const onVerifySecondFactor = async () => {
		if (isSubmitting || !secondFactorStrategy || !secondFactorCode.trim()) {
			return;
		}

		setIsSubmitting(true);
		setError(null);
		setInfo(null);

		try {
			const verifyResult =
				secondFactorStrategy === "email_code"
					? await signIn.mfa.verifyEmailCode({ code: secondFactorCode.trim() })
					: await signIn.mfa.verifyPhoneCode({ code: secondFactorCode.trim() });

			if (verifyResult.error) {
				setError(verifyResult.error.longMessage ?? "Invalid verification code.");
				return;
			}

			if (signIn.status === "complete") {
				await finalizeSignIn();
				return;
			}

			setError("Verification succeeded, but sign-in is not complete yet. Please try again.");
		} catch (caughtError: unknown) {
			const message = caughtError instanceof Error ? caughtError.message : "Unable to verify code";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onSubmit = async () => {
		if (isSubmitting || !emailAddress || !password) {
			return;
		}

		setIsSubmitting(true);
		setError(null);
		setInfo(null);

		try {
			const result = await signIn.password({
				emailAddress,
				password,
			});

			if (result.error) {
				logger.warn("Sign-in failed", {
					emailAddress,
					error: result.error.longMessage,
				});
				setError(result.error.longMessage ?? "Unable to sign in");
				return;
			}

			if (signIn.status === "complete") {
				await finalizeSignIn();
				return;
			}

			if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
				logger.info("Sign-in requires second factor", {
					emailAddress,
					status: signIn.status,
					supportedSecondFactors: signIn.supportedSecondFactors?.map((factor) => factor.strategy) ?? [],
				});
				await initiateSecondFactor();
				return;
			}

			logger.warn("Sign-in attempt not complete", {
				emailAddress,
				status: signIn.status,
			});
			setError("Sign-in is incomplete. Complete all steps to continue.");
		} catch (caughtError: unknown) {
			const message = caughtError instanceof Error ? caughtError.message : "Unable to sign in";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<View className='flex-1 bg-zinc-950 px-6 pt-24'>
			<Text className='text-3xl font-bold text-white'>Driver Sign In</Text>
			<Text className='mt-2 text-zinc-400'>Access your TaxiCiTi shift operations.</Text>

			<View className='mt-8 gap-3'>
				<TextInput value={emailAddress} onChangeText={setEmailAddress} autoCapitalize='none' keyboardType='email-address' placeholder='Email' placeholderTextColor='#71717A' className='rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white' />
				<TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder='Password' placeholderTextColor='#71717A' className='rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white' />
				{secondFactorStrategy ? (
					<TextInput
						value={secondFactorCode}
						onChangeText={setSecondFactorCode}
						keyboardType='number-pad'
						placeholder='Verification code'
						placeholderTextColor='#71717A'
						className='rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white'
					/>
				) : null}
			</View>

			{info ? <Text className='mt-3 text-zinc-300'>{info}</Text> : null}
			{error ? <Text className='mt-3 text-red-400'>{error}</Text> : null}

			<Pressable onPress={onSubmit} disabled={isSubmitting} className='mt-6 items-center rounded-xl bg-yellow-400 px-4 py-3'>
				<Text className='font-semibold text-zinc-900'>{isSubmitting ? "Signing in..." : "Sign in"}</Text>
			</Pressable>

			{secondFactorStrategy ? (
				<Pressable onPress={onVerifySecondFactor} disabled={isSubmitting} className='mt-3 items-center rounded-xl bg-zinc-700 px-4 py-3'>
					<Text className='font-semibold text-white'>{isSubmitting ? "Verifying..." : "Verify code"}</Text>
				</Pressable>
			) : null}

			<Link href='/(auth)/sign-up' className='mt-4 text-center text-zinc-300'>
				No account? Create one
			</Link>
		</View>
	);
}
