import { ActivityIndicator, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useRequests } from "../../src/hooks/useRequests";

function formatCurrency(value: number) {
	return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 2 }).format(value);
}

export default function DriverRequestsScreen() {
	const { isLoading, isConnected, activeTrip, incomingRequests, error, activePassengerCount, refreshRequests } = useRequests();
	const { height } = useWindowDimensions();

	return (
		<ScrollView className='flex-1 bg-zinc-100' contentContainerClassName='p-4 pb-28 gap-4'>
			<View className='rounded-3xl bg-zinc-900 overflow-hidden px-4 py-5'>
				<View className='absolute -top-10 -right-6 h-28 w-28 rounded-full bg-emerald-300/25' />
				<View className='absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10' />
				<Text className='text-2xl font-bold text-white'>Ride Requests</Text>
				<Text className='text-zinc-300 text-sm mt-1'>Monitor incoming passengers in realtime</Text>
				<View className='mt-4 self-start rounded-full px-3 py-1 border border-white/20 bg-white/10'>
					<Text className='text-[11px] font-semibold text-zinc-100'>Realtime: {isConnected ? "Connected" : "Offline"}</Text>
				</View>
			</View>

			{activeTrip ? (
				<View className='rounded-2xl bg-white border border-zinc-200 p-4 gap-2 shadow-sm'>
					<Text className='text-zinc-900 font-semibold'>{activeTrip.route.name}</Text>
					<Text className='text-zinc-600 text-sm'>Taxi {activeTrip.taxi.licensePlate}</Text>
					<Text className='text-zinc-500 text-xs'>Onboard passengers: {activePassengerCount}</Text>
				</View>
			) : (
				<View className='rounded-2xl bg-white border border-zinc-200 p-6 items-center justify-center gap-2' style={{ minHeight: Math.max(180, Math.floor(height * 0.28)) }}>
					<Text className='text-zinc-700 font-semibold'>No active shift yet</Text>
					<Text className='text-zinc-500 text-center'>Start a shift in Console to receive requests.</Text>
				</View>
			)}

			{isLoading ? (
				<View className='rounded-2xl bg-white border border-zinc-200 p-5 items-center gap-2'>
					<ActivityIndicator size='small' color='#f59e0b' />
					<Text className='text-zinc-500'>Loading request queue...</Text>
				</View>
			) : null}

			{error ? (
				<View className='rounded-2xl bg-red-50 border border-red-200 p-4'>
					<Text className='text-red-700 text-sm'>{error}</Text>
				</View>
			) : null}

			{!isLoading && activeTrip && incomingRequests.length === 0 ? (
				<View className='rounded-2xl bg-white border border-zinc-200 p-6 items-center justify-center gap-2' style={{ minHeight: Math.max(180, Math.floor(height * 0.24)) }}>
					<Text className='text-zinc-700 font-semibold'>Queue is clear</Text>
					<Text className='text-zinc-500 text-center'>No incoming requests right now.</Text>
				</View>
			) : null}

			{incomingRequests.map((request) => (
				<View key={request.id} className='rounded-2xl bg-white border border-zinc-200 p-4 gap-2 shadow-sm'>
					<View className='flex-row items-center justify-between'>
						<Text className='text-zinc-900 font-semibold'>{request.user?.firstName ?? "Passenger"}</Text>
						<Text className='text-emerald-600 font-bold'>{formatCurrency(request.fare)}</Text>
					</View>
					<Text className='text-zinc-600 text-sm'>Pickup: {request.pickupAddress}</Text>
					<Text className='text-zinc-600 text-sm'>Dropoff: {request.dropoffAddress}</Text>
					<View className='flex-row items-center justify-between pt-1'>
						<View className='px-2 py-1 rounded-full bg-zinc-100'>
							<Text className='text-[10px] font-semibold text-zinc-700'>{request.status}</Text>
						</View>
						<Text className='text-zinc-400 text-xs'>{request.createdAt ? new Date(request.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</Text>
					</View>
				</View>
			))}

			<Pressable onPress={() => void refreshRequests()} className='rounded-xl border border-zinc-300 py-3 items-center'>
				<Text className='text-zinc-700 font-semibold'>Refresh Requests</Text>
			</Pressable>
		</ScrollView>
	);
}
