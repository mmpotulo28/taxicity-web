import Constants from "expo-constants";
import { ClerkProvider } from "@clerk/clerk-expo";
import type { PropsWithChildren } from "react";

import { tokenCache } from "./token-cache";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Missing Clerk publishable key (EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY)");
}

const appScheme = Constants.expoConfig?.scheme ?? "taxiciti-driver-app";

export function MobileClerkProvider({ children }: PropsWithChildren) {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
      afterSignOutUrl={`${appScheme}:///(auth)/sign-in`}
      signInUrl="/(auth)/sign-in"
      signUpUrl="/(auth)/sign-up"
    >
      {children}
    </ClerkProvider>
  );
}
