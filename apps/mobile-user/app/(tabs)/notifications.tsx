import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useUserSettingsPreferences } from "../../src/features/settings/hooks/use-user-settings-preferences";

export default function NotificationsScreen() {
	const { preferences, saveStatus, togglePreference } = useUserSettingsPreferences();

	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-2 text-2xl font-bold text-white'>Notifications</Text>
			<Text className='mb-8 text-neutral-300'>Choose which updates you want to receive.</Text>
			{!preferences ? <Text className='mb-4 text-neutral-400'>Loading preferences...</Text> : null}
			{preferences ? (
				<View className='mb-4 gap-3'>
					<Pressable
						className='rounded-md border border-neutral-700 px-5 py-4'
						onPress={() => togglePreference("rideUpdatesEnabled")}>
						<Text className='text-white'>
							Ride Updates: {preferences.rideUpdatesEnabled ? "Enabled" : "Disabled"}
						</Text>
					</Pressable>
					<Pressable
						className='rounded-md border border-neutral-700 px-5 py-4'
						onPress={() => togglePreference("promotionalNotificationsEnabled")}>
						<Text className='text-white'>
							Promotions: {preferences.promotionalNotificationsEnabled ? "Enabled" : "Disabled"}
						</Text>
					</Pressable>
				</View>
			) : null}
			{saveStatus === "saving" ? <Text className='mb-4 text-neutral-400'>Saving preferences...</Text> : null}
			{saveStatus === "saved" ? <Text className='mb-4 text-brand'>Preferences saved.</Text> : null}
			{saveStatus === "error" ? <Text className='mb-4 text-red-300'>Failed to save preferences. Try again.</Text> : null}
			<Pressable className='rounded-md border border-neutral-700 px-5 py-4' onPress={() => router.push("/(tabs)/index")}>
				<Text className='text-white'>Go to Home</Text>
			</Pressable>
			<Pressable className='mt-4 rounded-md border border-neutral-700 px-5 py-4' onPress={() => router.back()}>
				<Text className='text-white'>Back</Text>
			</Pressable>
		</View>
	);
}
