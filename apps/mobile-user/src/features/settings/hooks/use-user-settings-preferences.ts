import { useCallback, useEffect, useMemo, useState } from "react";
import {
	defaultUserSettingsPreferences,
	getUserSettingsPreferences,
	saveUserSettingsPreferences,
	type UserSettingsPreferences,
} from "../utils/preferences";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useUserSettingsPreferences() {
	const [preferences, setPreferences] = useState<UserSettingsPreferences | null>(null);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

	useEffect(() => {
		let active = true;
		getUserSettingsPreferences().then((stored) => {
			if (active) {
				setPreferences(stored);
			}
		});
		return () => {
			active = false;
		};
	}, []);

	const updatePreferences = useCallback(async (next: UserSettingsPreferences) => {
		setPreferences(next);
		setSaveStatus("saving");
		try {
			await saveUserSettingsPreferences(next);
			setSaveStatus("saved");
		} catch {
			setSaveStatus("error");
		}
	}, []);

	const togglePreference = useCallback(
		async (key: keyof UserSettingsPreferences) => {
			if (!preferences) {
				return;
			}
			await updatePreferences({
				...preferences,
				[key]: !preferences[key],
			});
		},
		[preferences, updatePreferences]
	);

	const resetPreferences = useCallback(async () => {
		await updatePreferences(defaultUserSettingsPreferences);
	}, [updatePreferences]);

	const retrySave = useCallback(async () => {
		if (!preferences) {
			return;
		}
		await updatePreferences(preferences);
	}, [preferences, updatePreferences]);

	return useMemo(
		() => ({
			preferences,
			saveStatus,
			togglePreference,
			resetPreferences,
			retrySave,
		}),
		[preferences, resetPreferences, retrySave, saveStatus, togglePreference]
	);
}
