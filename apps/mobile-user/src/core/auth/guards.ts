import { useAuth } from "@clerk/clerk-expo";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

const authScreens = new Set(["sign-in", "sign-up"]);
const protectedGroups = new Set(["(tabs)", "(ride)"]);

export function useProtectedRoute() {
const { isLoaded, isSignedIn } = useAuth();
const segments = useSegments();
const router = useRouter();

useEffect(() => {
if (!isLoaded) {
return;
}

const first = segments[0];
const second = segments[1];
const inProtectedGroup = typeof first === "string" && protectedGroups.has(first);
const inAuthFlow = first === "(auth)" && typeof second === "string" && authScreens.has(second);

if (!isSignedIn && inProtectedGroup) {
router.replace("/(auth)/sign-in");
return;
}

if (isSignedIn && inAuthFlow) {
router.replace("/(tabs)");
}
}, [isLoaded, isSignedIn, router, segments]);
}
