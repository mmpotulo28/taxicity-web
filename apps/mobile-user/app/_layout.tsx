import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { useCallback, useEffect, useState } from "react";
import { tokenCache } from "../src/core/auth/token-cache";
import { useProtectedRoute } from "../src/core/auth/guards";
import { getClerkPublishableKey } from "../src/core/auth/clerk";
import { setAccessTokenProvider } from "../src/core/api/client";

const queryClient = new QueryClient();

function GuardedSlot() {
	useProtectedRoute();
	return <Slot />;
}

function AccessTokenBridge({ onReady }: { onReady: () => void }) {
	const { getToken } = useAuth();

	useEffect(() => {
		let isMounted = true;
		setAccessTokenProvider(async () => {
			return (await getToken()) ?? null;
		});
		queueMicrotask(() => {
			if (isMounted) {
				onReady();
			}
		});
		return () => {
			isMounted = false;
			setAccessTokenProvider(async () => null);
		};
	}, [getToken, onReady]);

	return null;
}

export default function RootLayout() {
	const [isTokenProviderReady, setIsTokenProviderReady] = useState(false);
	const handleTokenProviderReady = useCallback(() => {
		setIsTokenProviderReady(true);
	}, []);

	return (
		<ClerkProvider tokenCache={tokenCache} publishableKey={getClerkPublishableKey()}>
			<QueryClientProvider client={queryClient}>
				<AccessTokenBridge onReady={handleTokenProviderReady} />
				{isTokenProviderReady ? <GuardedSlot /> : null}
			</QueryClientProvider>
		</ClerkProvider>
	);
}
