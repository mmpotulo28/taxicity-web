import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useState } from "react";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { setApiAuthTokenGetter } from "../lib/api-client";
import { getHasCompletedOnboarding } from "../lib/onboarding";

const queryClient = new QueryClient();

function ApiAuthBridge() {
	const { getToken } = useAuth();

	useEffect(() => {
		setApiAuthTokenGetter(() => getToken());
		return () => {
			setApiAuthTokenGetter(null);
		};
	}, [getToken]);

	return null;
}

function AuthGuard() {
	const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
	const segments = useSegments();
	const router = useRouter();

	useEffect(() => {
		if (!isLoaded) {
			return;
		}

		const onAuthGroup = segments[0] === "(auth)";
		const onOnboardingGroup = segments[0] === "(onboarding)";

		if (onOnboardingGroup) {
			return;
		}

		if (!isSignedIn && !onAuthGroup) {
			router.replace("/(auth)/sign-in");
			return;
		}

		if (isSignedIn && onAuthGroup) {
			router.replace("/(tabs)");
		}
	}, [isLoaded, isSignedIn, segments, router]);

	return null;
}

function OnboardingGuard() {
	const [isLoaded, setIsLoaded] = useState(false);
	const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
	const segments = useSegments();
	const router = useRouter();

	const refreshOnboardingState = useCallback(async () => {
		const completed = await getHasCompletedOnboarding();
		setHasCompletedOnboarding(completed);
		setIsLoaded(true);
	}, []);

	useEffect(() => {
		void refreshOnboardingState();
	}, [refreshOnboardingState]);

	useEffect(() => {
		void refreshOnboardingState();
	}, [segments, refreshOnboardingState]);

	useEffect(() => {
		if (!isLoaded) {
			return;
		}

		const onOnboardingGroup = segments[0] === "(onboarding)";

		if (!hasCompletedOnboarding && !onOnboardingGroup) {
			router.replace("/(onboarding)");
			return;
		}

		if (hasCompletedOnboarding && onOnboardingGroup) {
			router.replace("/(auth)/sign-in");
		}
	}, [hasCompletedOnboarding, isLoaded, router, segments]);

	return null;
}

function MissingAuthConfigGuard() {
	const segments = useSegments();
	const router = useRouter();

	useEffect(() => {
		const onAuthGroup = segments[0] === "(auth)";
		const onOnboardingGroup = segments[0] === "(onboarding)";

		if (!onAuthGroup && !onOnboardingGroup) {
			router.replace("/(auth)/sign-in");
		}
	}, [segments, router]);

	return null;
}

export function AppProviders({ children }: Readonly<PropsWithChildren>) {
	const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

	if (!publishableKey) {
		return (
			<SafeAreaProvider>
				<QueryClientProvider client={queryClient}>
					<OnboardingGuard />
					<MissingAuthConfigGuard />
					{children}
				</QueryClientProvider>
			</SafeAreaProvider>
		);
	}

	return (
		<ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
			<ApiAuthBridge />
			<OnboardingGuard />
			<AuthGuard />
			<SafeAreaProvider>
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			</SafeAreaProvider>
		</ClerkProvider>
	);
}
