import React from "react";
import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "../src/core/auth/token-cache";
import { useProtectedRoute } from "../src/core/auth/guards";
import { getClerkPublishableKey } from "../src/core/auth/clerk";

const queryClient = new QueryClient();

function GuardedSlot() {
useProtectedRoute();
return <Slot />;
}

export default function RootLayout() {
return (
<ClerkProvider tokenCache={tokenCache} publishableKey={getClerkPublishableKey()}>
<QueryClientProvider client={queryClient}>
<GuardedSlot />
</QueryClientProvider>
</ClerkProvider>
);
}
