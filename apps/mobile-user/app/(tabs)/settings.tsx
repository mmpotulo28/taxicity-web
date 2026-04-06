import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useUserSettingsPreferences } from "../../src/features/settings/hooks/use-user-settings-preferences";

export default function SettingsTabScreen() {
	const { signOut } = useAuth();
	const { user } = useUser();
	const { resetPreferences } = useUserSettingsPreferences();
	const [resetStatus, setResetStatus] = useState<"idle" | "done" | "error">("idle");

	const handleSupport = () => {
		router.push("/(tabs)/support");
	};

	const handleNotifications = () => {
		router.push("/(tabs)/notifications");
	};

	const handlePrivacy = () => {
		router.push("/(tabs)/privacy");
	};

	const handleSignOut = async () => {
		await signOut();
		router.replace("/(auth)/sign-in");
	};

	const handleResetPreferences = async () => {
		Alert.alert("Reset Preferences", "This will restore all notification and privacy settings to defaults.", [
			{
				text: "Cancel",
				style: "cancel",
			},
			{
				text: "Reset",
				style: "destructive",
				onPress: async () => {
					try {
						await resetPreferences();
						setResetStatus("done");
					} catch {
						setResetStatus("error");
					}
				},
			},
		]);
	};

	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-2 text-2xl font-bold text-white'>Settings</Text>
			<Text className='mb-8 text-neutral-400'>{user?.primaryEmailAddress?.emailAddress || "Signed in user"}</Text>
			<View className='gap-3'>
				<Pressable className='rounded-md border border-neutral-700 px-5 py-4' onPress={handleSupport}>
					<Text className='text-white'>Support</Text>
				</Pressable>
				<Pressable className='rounded-md border border-neutral-700 px-5 py-4' onPress={handleNotifications}>
					<Text className='text-white'>Notifications Preferences</Text>
				</Pressable>
				<Pressable className='rounded-md border border-neutral-700 px-5 py-4' onPress={handlePrivacy}>
					<Text className='text-white'>Privacy Controls</Text>
				</Pressable>
				<Pressable className='rounded-md border border-neutral-700 px-5 py-4' onPress={handleResetPreferences}>
					<Text className='text-white'>Reset Preferences</Text>
				</Pressable>
				{resetStatus === "done" ? <Text className='text-brand'>Preferences reset to defaults.</Text> : null}
				{resetStatus === "error" ? <Text className='text-red-300'>Failed to reset preferences.</Text> : null}
				<Pressable className='mt-4 rounded-md bg-red-600 px-5 py-4' onPress={handleSignOut}>
					<Text className='font-semibold text-white'>Sign Out</Text>
				</Pressable>
			</View>
		</View>
	);
}
