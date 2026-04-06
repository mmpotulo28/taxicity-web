import * as SecureStore from "expo-secure-store";

const SETTINGS_KEY = "mobile-user:settings-preferences";

export interface UserSettingsPreferences {
	rideUpdatesEnabled: boolean;
	promotionalNotificationsEnabled: boolean;
	shareTripDataEnabled: boolean;
	locationTrackingEnabled: boolean;
}

export const defaultUserSettingsPreferences: UserSettingsPreferences = {
	rideUpdatesEnabled: true,
	promotionalNotificationsEnabled: false,
	shareTripDataEnabled: false,
	locationTrackingEnabled: true,
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function toBoolean(value: unknown, fallback: boolean): boolean {
	return typeof value === "boolean" ? value : fallback;
}

function normalizePreferences(value: unknown): UserSettingsPreferences {
	if (!isRecord(value)) {
		return defaultUserSettingsPreferences;
	}

	return {
		rideUpdatesEnabled: toBoolean(value.rideUpdatesEnabled, defaultUserSettingsPreferences.rideUpdatesEnabled),
		promotionalNotificationsEnabled: toBoolean(
			value.promotionalNotificationsEnabled,
			defaultUserSettingsPreferences.promotionalNotificationsEnabled
		),
		shareTripDataEnabled: toBoolean(value.shareTripDataEnabled, defaultUserSettingsPreferences.shareTripDataEnabled),
		locationTrackingEnabled: toBoolean(value.locationTrackingEnabled, defaultUserSettingsPreferences.locationTrackingEnabled),
	};
}

export async function getUserSettingsPreferences(): Promise<UserSettingsPreferences> {
	try {
		const raw = await SecureStore.getItemAsync(SETTINGS_KEY);
		if (!raw) {
			return defaultUserSettingsPreferences;
		}
		return normalizePreferences(JSON.parse(raw) as unknown);
	} catch {
		return defaultUserSettingsPreferences;
	}
}

export async function saveUserSettingsPreferences(preferences: UserSettingsPreferences): Promise<void> {
	await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(preferences));
}
