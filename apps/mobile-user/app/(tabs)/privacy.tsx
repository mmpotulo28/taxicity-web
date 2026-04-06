import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function PrivacyScreen() {
	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-2 text-2xl font-bold text-white'>Privacy</Text>
			<Text className='mb-8 text-neutral-300'>
				Your ride and account data are handled according to TaxiCiTi privacy policy. Detailed controls are being added next.
			</Text>
			<Pressable className='rounded-md border border-neutral-700 px-5 py-4' onPress={() => router.push("/(tabs)/settings")}>
				<Text className='text-white'>Return to Settings</Text>
			</Pressable>
			<Pressable className='mt-4 rounded-md border border-neutral-700 px-5 py-4' onPress={() => router.back()}>
				<Text className='text-white'>Back</Text>
			</Pressable>
		</View>
	);
}
