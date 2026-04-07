import { Pressable, Text, View } from "react-native";
import type { TripRequest } from "../../modules/driver-console/useDriverConsole";
import { formatCurrency } from "../../lib/driverConsoleUtils";

export function RequestCard({ request, onAccept, onDecline }: Readonly<{ request: TripRequest; onAccept: (id: string) => void; onDecline: (id: string) => void }>) {
	return (
		<View className='rounded-3xl bg-blue-50 border border-blue-200 p-4 gap-3 shadow-sm'>
			<View className='flex-row items-center justify-between'>
				<View className='flex-row items-center gap-2 flex-1'>
					<Text className='text-2xl'>👤</Text>
					<Text className='font-bold text-slate-900 text-lg flex-1' numberOfLines={1}>{request.user?.firstName ?? "Passenger"}</Text>
				</View>
				<View className='bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200'>
					<Text className='font-bold text-emerald-800 text-sm'>💰 {formatCurrency(request.fare)}</Text>
				</View>
			</View>
			<View className='bg-white rounded-2xl p-3 gap-3 border border-blue-100 shadow-sm'>
				<View className='flex-row gap-2 items-start'>
					<Text className='text-lg mt-0.5'>📍</Text>
					<View className='flex-1'>
						<Text className='text-slate-500 text-[10px] font-bold uppercase tracking-widest'>Pickup</Text>
						<Text className='text-slate-800 font-semibold text-sm'>{request.pickupAddress}</Text>
					</View>
				</View>
				<View className='flex-row gap-2 items-start'>
					<Text className='text-lg mt-0.5'>🏁</Text>
					<View className='flex-1'>
						<Text className='text-slate-500 text-[10px] font-bold uppercase tracking-widest'>Dropoff</Text>
						<Text className='text-slate-800 font-semibold text-sm'>{request.dropoffAddress}</Text>
					</View>
				</View>
			</View>
			<View className='flex-row gap-3 mt-1'>
				<Pressable 
					onPress={() => onAccept(request.id)} 
					className='flex-1 rounded-2xl bg-emerald-500 py-3.5 items-center justify-center border-b-4 border-emerald-700 shadow-sm'
				>
					<Text className='font-bold text-white text-base'>✅ Accept</Text>
				</Pressable>
				<Pressable 
					onPress={() => onDecline(request.id)} 
					className='flex-1 rounded-2xl bg-red-100 border-2 border-red-300 py-3.5 items-center justify-center shadow-sm'
				>
					<Text className='font-bold text-red-600 text-base'>❌ Decline</Text>
				</Pressable>
			</View>
		</View>
	);
}
