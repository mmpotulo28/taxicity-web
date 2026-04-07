import * as SecureStore from "expo-secure-store";

const ONBOARDING_DONE_KEY = "driver_onboarding_done_v1";

export async function getHasCompletedOnboarding() {
	try {
		const value = await SecureStore.getItemAsync(ONBOARDING_DONE_KEY);
		return value === "1";
	} catch {
		return false;
	}
}

export async function setHasCompletedOnboarding() {
	try {
		await SecureStore.setItemAsync(ONBOARDING_DONE_KEY, "1");
	} catch {
		// Ignore persistence failures and continue navigation flow.
	}
}
