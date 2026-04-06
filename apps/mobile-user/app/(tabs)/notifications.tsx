import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function NotificationsScreen() {
	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-2 text-2xl font-bold text-white'>Notifications</Text>
			<Text className='mb-8 text-neutral-300'>Notification preferences setup is coming next. You can continue using ride updates in-app.</Text>
			<Pressable className='rounded-md border border-neutral-700 px-5 py-4' onPress={() => router.push("/(tabs)/index")}>
				<Text className='text-white'>Go to Home</Text>
			</Pressable>
			<Pressable className='mt-4 rounded-md border border-neutral-700 px-5 py-4' onPress={() => router.back()}>
				<Text className='text-white'>Back</Text>
			</Pressable>
		</View>
	);
}
