import { useEffect, useState } from "react";
import { useAuth, useSignIn, useSignUp } from "@clerk/expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";

export default function DriverSignInScreen() {
	const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
	const [activeAction, setActiveAction] = useState<"none" | "signIn" | "signUp" | "verifySignIn" | "verifySignUp">("none");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [verifyCode, setVerifyCode] = useState("");
	const [flowError, setFlowError] = useState<string | null>(null);
	const params = useLocalSearchParams<{ mode?: string }>();
	const { height } = useWindowDimensions();

	const { isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
	const { signIn } = useSignIn();
	const { signUp } = useSignUp();
	const router = useRouter();

	useEffect(() => {
		if (isSignedIn) {
			router.replace("/(tabs)");
		}
	}, [isSignedIn, router]);

	useEffect(() => {
		if (params.mode === "signIn" || params.mode === "signUp") {
			setMode(params.mode);
		}
	}, [params.mode]);

	const isBusy = activeAction !== "none";

	function extractClerkErrorMessage(error: unknown, fallback: string) {
		if (!error || typeof error !== "object") {
			return fallback;
		}

		if ("message" in error && typeof error.message === "string" && error.message.length > 0) {
			return error.message;
		}

		if ("errors" in error && Array.isArray(error.errors) && error.errors.length > 0) {
			const issue = error.errors[0];
			if (issue && typeof issue === "object") {
				if ("longMessage" in issue && typeof issue.longMessage === "string" && issue.longMessage.length > 0) {
					return issue.longMessage;
				}
				if ("message" in issue && typeof issue.message === "string" && issue.message.length > 0) {
					return issue.message;
				}
			}
		}

		return fallback;
	}

	const inSignUpVerification = signUp.status === "missing_requirements" && signUp.unverifiedFields.includes("email_address") && signUp.missingFields.length === 0;

	const inClientTrustVerification = signIn.status === "needs_client_trust";
	const showCredentialForm = !inSignUpVerification && !inClientTrustVerification;

	useEffect(() => {
		setFlowError(null);
		// Reset stale action errors while user is editing form fields.
	}, [email, password, verifyCode, mode]);

	useEffect(() => {
		if (activeAction === "none") {
			return;
		}

		const timeoutId = setTimeout(() => {
			setActiveAction("none");
			setFlowError("This is taking longer than expected. Please check your connection and try again.");
		}, 20000);

		return () => clearTimeout(timeoutId);
	}, [activeAction]);

	async function handleSignIn() {
		setFlowError(null);
		if (!email.trim() || !password) {
			setFlowError("Enter your email and password to continue.");
			return;
		}
		setActiveAction("signIn");

		try {
			const { error } = await signIn.password({
				emailAddress: email.trim(),
				password,
			});

			console.log("Sign-in attempt result:", { status: signIn.status, error });

			if (error) {
				setFlowError(extractClerkErrorMessage(error, "Unable to sign in. Check your credentials and try again."));
				return;
			}

			if (signIn.status === "complete") {
				await signIn.finalize();
				router.replace("/(tabs)");
				return;
			}

			if (signIn.status === "needs_client_trust") {
				const emailCodeFactor = signIn.supportedSecondFactors.find((factor) => factor.strategy === "email_code");
				if (emailCodeFactor) {
					await signIn.mfa.sendEmailCode();
				}
				return;
			}

			if (signIn.status === "needs_second_factor") {
				setFlowError("Multi-factor authentication is required. Complete second factor to continue.");
				return;
			}

			setFlowError("Sign-in could not be completed. Please try again.");
		} catch (error) {
			setFlowError(extractClerkErrorMessage(error, "Unable to sign in. Check your credentials and try again."));
		} finally {
			setActiveAction("none");
		}
	}

	async function handleVerifySignInEmailCode() {
		setFlowError(null);
		if (!verifyCode.trim()) {
			setFlowError("Enter your verification code to continue.");
			return;
		}
		setActiveAction("verifySignIn");
		try {
			await signIn.mfa.verifyEmailCode({ code: verifyCode.trim() });

			if (signIn.status === "complete") {
				await signIn.finalize();
				router.replace("/(tabs)");
				return;
			}

			setFlowError("Verification failed. Please check your code and try again.");
		} catch (error) {
			setFlowError(extractClerkErrorMessage(error, "Verification failed. Please check your code and try again."));
		} finally {
			setActiveAction("none");
		}
	}

	async function handleSignUp() {
		setFlowError(null);
		if (!email.trim() || !password) {
			setFlowError("Enter your email and password to continue.");
			return;
		}
		setActiveAction("signUp");

		try {
			const { error } = await signUp.password({
				emailAddress: email.trim(),
				password,
			});

			if (error) {
				setFlowError(extractClerkErrorMessage(error, "Unable to complete sign up. Please check your details and try again."));
				return;
			}

			await signUp.verifications.sendEmailCode();
		} catch (error) {
			setFlowError(extractClerkErrorMessage(error, "Unable to complete sign up. Please check your details and try again."));
		} finally {
			setActiveAction("none");
		}
	}

	async function handleVerifySignUpEmailCode() {
		setFlowError(null);
		if (!verifyCode.trim()) {
			setFlowError("Enter your verification code to continue.");
			return;
		}
		setActiveAction("verifySignUp");

		try {
			await signUp.verifications.verifyEmailCode({
				code: verifyCode.trim(),
			});

			if (signUp.status === "complete") {
				await signUp.finalize();
				router.replace("/(tabs)");
				return;
			}

			setFlowError("Sign-up verification is incomplete. Try entering the latest code.");
		} catch (error) {
			setFlowError(extractClerkErrorMessage(error, "Sign-up verification failed. Please check your code and try again."));
		} finally {
			setActiveAction("none");
		}
	}

	const activeErrorMessage = flowError;

	return (
		<ScrollView className='flex-1 bg-slate-950' contentContainerClassName='p-4 justify-center' contentContainerStyle={{ minHeight: height, paddingBottom: 24 }} keyboardShouldPersistTaps='handled'>
			<View className='absolute -top-14 -right-8 h-56 w-56 rounded-full bg-amber-400/25' />
			<View className='absolute top-52 -left-10 h-44 w-44 rounded-full bg-sky-400/15' />

			<View className='rounded-3xl border border-white/15 bg-white/10 p-5 gap-5'>
				<View className='gap-3'>
					<View className='self-start rounded-full px-3 py-1 border border-white/25 bg-white/10'>
						<Text className='text-[11px] font-semibold text-zinc-100'>TaxiCiTi Driver</Text>
					</View>

					<View className='flex-row items-center gap-3'>
						<View className='h-12 w-12 rounded-2xl items-center justify-center bg-amber-300/25 border border-amber-200/30'>
							<MaterialCommunityIcons name='shield-car' size={24} color='#fbbf24' />
						</View>
						<View className='flex-1'>
							<Text className='text-2xl font-bold text-white'>{mode === "signIn" ? "Welcome Back" : "Create Account"}</Text>
							<Text className='text-zinc-300 text-sm mt-1'>{mode === "signIn" ? "Securely continue your shift and earnings." : "Join TaxiCiTi and start driving smarter."}</Text>
						</View>
					</View>
				</View>

				{showCredentialForm ? (
					<View className='flex-row rounded-2xl bg-white/10 border border-white/20 p-1'>
						<Pressable onPress={() => setMode("signIn")} className={`flex-1 rounded-xl py-2.5 items-center ${mode === "signIn" ? "bg-amber-400" : "bg-transparent"}`}>
							<Text className={mode === "signIn" ? "font-bold text-zinc-900" : "font-semibold text-zinc-200"}>Login</Text>
						</Pressable>
						<Pressable onPress={() => setMode("signUp")} className={`flex-1 rounded-xl py-2.5 items-center ${mode === "signUp" ? "bg-amber-400" : "bg-transparent"}`}>
							<Text className={mode === "signUp" ? "font-bold text-zinc-900" : "font-semibold text-zinc-200"}>Sign Up</Text>
						</Pressable>
					</View>
				) : null}

				{activeErrorMessage ? (
					<View className='rounded-2xl border border-red-300/35 bg-red-500/15 p-3 flex-row gap-2'>
						<MaterialCommunityIcons name='alert-circle-outline' size={18} color='#fda4af' />
						<Text className='text-sm text-rose-100 flex-1'>{activeErrorMessage}</Text>
					</View>
				) : null}

				{inSignUpVerification ? (
					<View className='gap-3'>
						<View className='rounded-2xl border border-white/20 bg-white/10 p-4 gap-2'>
							<Text className='text-zinc-100 font-semibold'>Verify your account</Text>
							<Text className='text-zinc-300 text-sm'>Enter the email code sent to {email.trim()}.</Text>
						</View>
						<TextInput value={verifyCode} onChangeText={setVerifyCode} placeholder='Email verification code' placeholderTextColor='#94a3b8' keyboardType='number-pad' className='rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 text-white text-base' />
						<Pressable onPress={() => void handleVerifySignUpEmailCode()} disabled={!verifyCode.trim() || isBusy} className={`rounded-2xl py-3.5 items-center ${!verifyCode.trim() || isBusy ? "bg-zinc-500" : "bg-amber-400"}`}>
							<Text className='font-bold text-zinc-900'>{activeAction === "verifySignUp" ? "Verifying..." : "Verify Account"}</Text>
						</Pressable>
						<Pressable onPress={() => void signUp.verifications.sendEmailCode()} disabled={isBusy} className='rounded-2xl border border-white/25 bg-white/5 py-3 items-center'>
							<Text className='font-semibold text-zinc-100'>Resend Code</Text>
						</Pressable>
					</View>
				) : inClientTrustVerification ? (
					<View className='gap-3'>
						<View className='rounded-2xl border border-white/20 bg-white/10 p-4 gap-2'>
							<Text className='text-zinc-100 font-semibold'>Security verification</Text>
							<Text className='text-zinc-300 text-sm'>Enter the email code to finish sign in.</Text>
						</View>
						<TextInput value={verifyCode} onChangeText={setVerifyCode} placeholder='Verification code' placeholderTextColor='#94a3b8' keyboardType='number-pad' className='rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 text-white text-base' />
						<Pressable onPress={() => void handleVerifySignInEmailCode()} disabled={!verifyCode.trim() || isBusy} className={`rounded-2xl py-3.5 items-center ${!verifyCode.trim() || isBusy ? "bg-zinc-500" : "bg-amber-400"}`}>
							<Text className='font-bold text-zinc-900'>{activeAction === "verifySignIn" ? "Verifying..." : "Verify Login"}</Text>
						</Pressable>
						<Pressable onPress={() => void signIn.mfa.sendEmailCode()} disabled={isBusy} className='rounded-2xl border border-white/25 bg-white/5 py-3 items-center'>
							<Text className='font-semibold text-zinc-100'>Resend Code</Text>
						</Pressable>
					</View>
				) : (
					<View className='gap-3'>
						<View className='gap-1.5'>
							<Text className='text-zinc-200 text-xs uppercase tracking-wider'>Email</Text>
							<TextInput value={email} onChangeText={setEmail} autoCapitalize='none' autoCorrect={false} autoComplete='email' keyboardType='email-address' placeholder='name@email.com' placeholderTextColor='#94a3b8' className='rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 text-white text-base' />
						</View>

						<View className='gap-1.5'>
							<Text className='text-zinc-200 text-xs uppercase tracking-wider'>Password</Text>
							<TextInput value={password} onChangeText={setPassword} secureTextEntry autoComplete='password' placeholder='Enter your password' placeholderTextColor='#94a3b8' className='rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 text-white text-base' />
						</View>

						<Pressable onPress={() => void (mode === "signIn" ? handleSignIn() : handleSignUp())} disabled={!email.trim() || !password || isBusy} className={`rounded-2xl py-3.5 items-center ${!email.trim() || !password || isBusy ? "bg-zinc-500" : "bg-amber-400"}`}>
							{isBusy ? <ActivityIndicator size='small' color='#18181b' /> : <Text className='font-bold text-zinc-900'>{mode === "signIn" ? "Continue to Dashboard" : "Create Account"}</Text>}
						</Pressable>
					</View>
				)}

				{showCredentialForm ? (
					<Pressable
						onPress={() => {
							setMode((current) => (current === "signIn" ? "signUp" : "signIn"));
							setFlowError(null);
							setVerifyCode("");
						}}
						className='items-center py-1'>
						<Text className='text-amber-200 font-semibold'>{mode === "signIn" ? "Need an account? Sign up" : "Already have an account? Sign in"}</Text>
					</Pressable>
				) : null}
			</View>
		</ScrollView>
	);
}
