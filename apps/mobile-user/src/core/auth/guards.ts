import { useAuth } from "@clerk/clerk-expo";
import { usePathname, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

const protectedGroups = new Set(["(tabs)", "(ride)"]);

export function useProtectedRoute() {
const { isLoaded, isSignedIn } = useAuth();
const segments = useSegments();
const pathname = usePathname();
const router = useRouter();

useEffect(() => {
if (!isLoaded) {
return;
}

const first = segments[0];
const inProtectedGroup = typeof first === "string" && protectedGroups.has(first);
const inAuthFlow = pathname.startsWith("/(auth)/");

if (!isSignedIn && inProtectedGroup) {
router.replace("/(auth)/sign-in");
return;
}

if (isSignedIn && inAuthFlow) {
router.replace("/(tabs)");
}
}, [isLoaded, isSignedIn, pathname, router, segments]);
}
