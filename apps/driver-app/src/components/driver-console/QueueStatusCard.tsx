import { Pressable, Text, View } from "react-native";
import type { QueueStatus } from "./types";

export function QueueStatusCard({ queueStatus, onLeave }: Readonly<{ queueStatus: Exclude<QueueStatus, null>; onLeave: () => void }>) {
	if (!queueStatus.rank) {
		return null;
	}

	return (
		<View className='rounded-3xl bg-emerald-50 border-2 border-emerald-300 p-5 mt-3 gap-4 shadow-sm'>
			<View className='flex-row items-center gap-2'>
				<Text className='text-3xl'>✅</Text>
				<Text className='text-emerald-800 font-bold text-xl flex-1'>In Queue: {queueStatus.rank.name}</Text>
			</View>
			<View className='bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm'>
				<View className='flex-row justify-between items-center mb-3'>
					<Text className='text-emerald-700 font-semibold text-base'>Position</Text>
					<Text className='text-emerald-900 font-black text-2xl'>
						{queueStatus.position ?? "-"} / {queueStatus.queueLength ?? "-"}
					</Text>
				</View>
				<View className='w-full bg-emerald-100 rounded-full h-3'>
					<View 
						className='bg-emerald-500 h-3 rounded-full'
						style={{
							width: `${
								queueStatus.queueLength && queueStatus.position
									? (queueStatus.position / queueStatus.queueLength) * 100
									: 0
							}%`
						}}
					/>
				</View>
			</View>
			<Pressable 
				onPress={onLeave} 
				className='rounded-2xl border-2 border-emerald-600 bg-white py-3 items-center justify-center shadow-sm mt-1'
			>
				<Text className='font-bold text-emerald-700 text-lg'>👋 Leave Queue</Text>
			</Pressable>
		</View>
	);
}
