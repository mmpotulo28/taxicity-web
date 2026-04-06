import React from "react";
import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { tokenCache } from "../src/core/auth/token-cache";
import { useProtectedRoute } from "../src/core/auth/guards";
import { getClerkPublishableKey } from "../src/core/auth/clerk";
import { setAccessTokenProvider } from "../src/core/api/client";

const queryClient = new QueryClient();

function GuardedSlot() {
	useProtectedRoute();
	return <Slot />;
}

function AccessTokenBridge() {
	const { getToken } = useAuth();

	useEffect(() => {
		setAccessTokenProvider(async () => {
			return (await getToken()) ?? null;
		});
	}, [getToken]);

	return null;
}

export default function RootLayout() {
	return (
		<ClerkProvider tokenCache={tokenCache} publishableKey={getClerkPublishableKey()}>
			<QueryClientProvider client={queryClient}>
				<AccessTokenBridge />
				<GuardedSlot />
			</QueryClientProvider>
		</ClerkProvider>
	);
}
