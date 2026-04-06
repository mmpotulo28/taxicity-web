import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
	getUserSettingsPreferences,
	saveUserSettingsPreferences,
	type UserSettingsPreferences,
} from "../../src/features/settings/utils/preferences";

export default function PrivacyScreen() {
	const [preferences, setPreferences] = useState<UserSettingsPreferences | null>(null);
	const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

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

	const togglePreference = async (key: "shareTripDataEnabled" | "locationTrackingEnabled") => {
		if (!preferences) {
			return;
		}
		const next: UserSettingsPreferences = {
			...preferences,
			[key]: !preferences[key],
		};
		setPreferences(next);
		await saveUserSettingsPreferences(next);
		setSaveStatus("saved");
	};

	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-2 text-2xl font-bold text-white'>Privacy</Text>
			<Text className='mb-8 text-neutral-300'>Manage data sharing and location permissions used during rides.</Text>
			{!preferences ? <Text className='mb-4 text-neutral-400'>Loading privacy controls...</Text> : null}
			{preferences ? (
				<View className='mb-4 gap-3'>
					<Pressable
						className='rounded-md border border-neutral-700 px-5 py-4'
						onPress={() => togglePreference("shareTripDataEnabled")}>
						<Text className='text-white'>
							Share Trip Data: {preferences.shareTripDataEnabled ? "Enabled" : "Disabled"}
						</Text>
					</Pressable>
					<Pressable
						className='rounded-md border border-neutral-700 px-5 py-4'
						onPress={() => togglePreference("locationTrackingEnabled")}>
						<Text className='text-white'>
							Location Tracking: {preferences.locationTrackingEnabled ? "Enabled" : "Disabled"}
						</Text>
					</Pressable>
				</View>
			) : null}
			{saveStatus === "saved" ? <Text className='mb-4 text-brand'>Privacy controls saved.</Text> : null}
			<Pressable className='rounded-md border border-neutral-700 px-5 py-4' onPress={() => router.push("/(tabs)/settings")}>
				<Text className='text-white'>Return to Settings</Text>
			</Pressable>
			<Pressable className='mt-4 rounded-md border border-neutral-700 px-5 py-4' onPress={() => router.back()}>
				<Text className='text-white'>Back</Text>
			</Pressable>
		</View>
	);
}
