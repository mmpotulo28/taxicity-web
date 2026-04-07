import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function DriverStatusScreen() {
	return (
		<View className='flex-1 bg-zinc-100 p-4 items-center justify-center'>
			<View className='w-full max-w-md rounded-2xl bg-white border border-zinc-200 p-6 gap-4'>
				<Text className='text-2xl font-bold text-zinc-900 text-center'>Application Pending</Text>
				<Text className='text-zinc-500 text-center'>Your driver application is under review. This usually takes 24-48 hours.</Text>
				<View className='rounded-xl bg-zinc-100 p-3 gap-2'>
					<Text className='font-semibold text-zinc-800'>What happens next?</Text>
					<Text className='text-zinc-600 text-sm'>We verify your license, vehicle docs, and complete a background check.</Text>
				</View>
				<Pressable onPress={() => router.replace("/")} className='rounded-xl border border-zinc-300 py-3 items-center'>
					<Text className='font-semibold text-zinc-700'>Back to Home</Text>
				</Pressable>
			</View>
		</View>
	);
}
