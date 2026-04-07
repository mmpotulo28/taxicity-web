import { Pressable, Text, View } from "react-native";
import type { RideStatusPayload } from "@taxiciti/utils";
import type { TripRequest } from "../../modules/driver-console/useDriverConsole";
import { getNextStatus } from "../../lib/driverConsoleUtils";

export function PassengerCard({ passenger, onAdvance }: Readonly<{ passenger: TripRequest; onAdvance: (id: string, status: RideStatusPayload["status"]) => void }>) {
	const next = getNextStatus(passenger.status);
	
	const statusEmoji: Record<string, string> = {
		"ACCEPTED": "✅",
		"ARRIVED_AT_PICKUP": "📍",
		"IN_PROGRESS": "🚕",
		"COMPLETED": "🏁",
	};
    
    // Convert status to readable text
    const displayStatus = passenger.status.replace(/_/g, ' ');

	return (
		<View className='rounded-3xl bg-amber-50 border border-amber-200 p-4 gap-3 shadow-sm'>
			<View className='flex-row items-center justify-between'>
				<View className='flex-row items-center gap-2 flex-1'>
					<Text className='text-2xl'>👤</Text>
					<Text className='font-bold text-slate-900 text-lg flex-1' numberOfLines={1}>{passenger.user?.firstName ?? "Passenger"}</Text>
				</View>
				<View className='bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200'>
					<Text className='text-amber-800 font-bold text-xs'>{statusEmoji[passenger.status] || "⚙️"} {displayStatus}</Text>
				</View>
			</View>
			<View className='bg-white rounded-2xl p-3 gap-3 border border-amber-100 shadow-sm'>
				<View className='flex-row gap-2 items-start'>
					<Text className='text-lg mt-0.5'>📍</Text>
					<View className='flex-1'>
						<Text className='text-slate-500 text-[10px] font-bold uppercase tracking-widest'>Pickup</Text>
						<Text className='text-slate-800 font-semibold text-sm'>{passenger.pickupAddress}</Text>
					</View>
				</View>
				<View className='flex-row gap-2 items-start'>
					<Text className='text-lg mt-0.5'>🏁</Text>
					<View className='flex-1'>
						<Text className='text-slate-500 text-[10px] font-bold uppercase tracking-widest'>Dropoff</Text>
						<Text className='text-slate-800 font-semibold text-sm'>{passenger.dropoffAddress}</Text>
					</View>
				</View>
			</View>
			{next ? (
				<Pressable 
					onPress={() => onAdvance(passenger.id, next)} 
					className='rounded-2xl bg-emerald-500 py-3.5 items-center justify-center border-b-4 border-emerald-700 shadow-sm mt-1'
				>
					<Text className='font-bold text-white text-base'>➡️ Mark as {next.replace(/_/g, ' ')}</Text>
				</Pressable>
			) : null}
		</View>
	);
}
