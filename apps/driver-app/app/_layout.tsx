import "../global.css";

import { Redirect, Slot, useSegments } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { ClerkLoaded, ClerkLoading, useAuth } from "@clerk/expo";

import { AppProviders } from "../src/shared/ui/app-providers";
import { useDriverEligibility } from "../src/features/driver-profile/hooks/use-driver-eligibility";
import { useFlowPushRegistration } from "../src/core/push/use-flowpush-registration";

function RootGate() {
	const segments = useSegments();
	const { isSignedIn } = useAuth();
	const { data, isLoading } = useDriverEligibility(Boolean(isSignedIn));

	const topSegment = segments[0];
	const isAuthRoute = topSegment === "(auth)";
	const isOnboardingRoute = topSegment === "(onboarding)";

	if (!isSignedIn) {
		if (!isAuthRoute) {
			return <Redirect href='/(auth)/sign-in' />;
		}

		return <Slot />;
	}

	if (isLoading) {
		return (
			<View className='flex-1 items-center justify-center bg-zinc-950'>
				<ActivityIndicator size='large' color='#FACC15' />
				<Text className='mt-3 text-zinc-400'>Loading driver profile...</Text>
			</View>
		);
	}

	if (!data?.isEligible) {
		if (!isOnboardingRoute) {
			return <Redirect href='/(onboarding)/apply' />;
		}

		return <Slot />;
	}

	if (isAuthRoute || isOnboardingRoute) {
		return <Redirect href='/(tabs)/dashboard' />;
	}

	return <Slot />;
}

function RootLayoutContent() {
	const { isSignedIn, userId } = useAuth();

	useFlowPushRegistration(isSignedIn, userId);

	return (
		<>
			<ClerkLoading>
				<View className='flex-1 items-center justify-center bg-zinc-950'>
					<ActivityIndicator size='large' color='#FACC15' />
				</View>
			</ClerkLoading>
			<ClerkLoaded>
				<RootGate />
			</ClerkLoaded>
		</>
	);
}

export default function RootLayout() {
	return (
		<AppProviders>
			<RootLayoutContent />
		</AppProviders>
	);
}
