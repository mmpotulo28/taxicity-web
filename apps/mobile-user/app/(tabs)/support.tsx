import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function SupportScreen() {
	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-2 text-2xl font-bold text-white'>Support</Text>
			<Text className='mb-8 text-neutral-300'>Need help? Review your recent trips or contact support@taxiciti.app.</Text>
			<Pressable className='rounded-md border border-neutral-700 px-5 py-4' onPress={() => router.push("/(tabs)/history")}>
				<Text className='text-white'>Open Trip History</Text>
			</Pressable>
			<Pressable className='mt-4 rounded-md border border-neutral-700 px-5 py-4' onPress={() => router.back()}>
				<Text className='text-white'>Back</Text>
			</Pressable>
		</View>
	);
}
