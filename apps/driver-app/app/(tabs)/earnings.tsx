import { ActivityIndicator, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatCurrency, useDriverEarnings } from "../../src/hooks/useDriverEarnings";

export default function DriverEarningsScreen() {
	const { stats, loading, page, trips, totalPages, pagedTrips, cards, goPreviousPage, goNextPage } = useDriverEarnings();
	const { height } = useWindowDimensions();

	if (loading) {
		return (
			<View className='flex-1 bg-zinc-100 items-center justify-center gap-3' style={{ minHeight: height }}>
				<ActivityIndicator size='large' color='#f59e0b' />
				<Text className='text-zinc-500'>Loading earnings...</Text>
			</View>
		);
	}

	if (!stats) {
		return (
			<View className='flex-1 bg-zinc-100 items-center justify-center p-6 gap-3' style={{ minHeight: height }}>
				<MaterialCommunityIcons name='alert-circle-outline' size={40} color='#ef4444' />
				<Text className='text-zinc-600 text-center'>Failed to load earnings data.</Text>
			</View>
		);
	}

	const disablePrevious = page <= 1;
	const disableNext = page >= totalPages;

	return (
		<ScrollView className='flex-1 bg-zinc-100' contentContainerClassName='p-4 pb-28 gap-4'>
			<View className='rounded-3xl bg-zinc-900 overflow-hidden px-4 py-5'>
				<View className='absolute -top-8 -right-8 h-28 w-28 rounded-full bg-amber-300/30' />
				<View className='absolute top-10 -left-10 h-24 w-24 rounded-full bg-white/10' />
				<View className='flex-row items-center gap-3'>
					<View className='h-11 w-11 rounded-2xl bg-amber-300/25 items-center justify-center'>
						<MaterialCommunityIcons name='wallet-outline' size={24} color='#fbbf24' />
					</View>
					<View className='flex-1 gap-1'>
						<Text className='text-xl font-bold text-white'>Earnings Dashboard</Text>
						<Text className='text-zinc-300 text-sm'>Track income, trends, and completed trips</Text>
					</View>
				</View>
				<View className='mt-4 rounded-2xl bg-white/10 border border-white/15 px-3 py-2 self-start'>
					<Text className='text-amber-200 text-xs font-semibold'>Total Earned: {formatCurrency(stats.total)}</Text>
				</View>
			</View>

			<View className='flex-row flex-wrap gap-3'>
				{cards.map((card) => (
					<View key={card.label} className='w-[48%] rounded-2xl bg-white border border-zinc-200 p-3.5 shadow-sm'>
						<View className='h-8 w-8 rounded-md items-center justify-center mb-2' style={{ backgroundColor: `${card.color}20` }}>
							<MaterialCommunityIcons name={card.icon} size={16} color={card.color} />
						</View>
						<Text className='text-xs text-zinc-500'>{card.label}</Text>
						<Text className='text-lg font-bold text-zinc-900 mt-1'>{card.value}</Text>
					</View>
				))}
			</View>

			<View className='rounded-2xl bg-white border border-zinc-200 overflow-hidden'>
				<View className='p-4 flex-row items-center justify-between border-b border-zinc-100'>
					<View className='flex-row items-center gap-2'>
						<MaterialCommunityIcons name='history' size={18} color='#71717a' />
						<Text className='text-lg font-semibold text-zinc-900'>Trip History</Text>
					</View>
					<View className='px-2 py-1 rounded-full bg-amber-100'>
						<Text className='text-xs text-amber-700 font-semibold'>{trips.length} Total Trips</Text>
					</View>
				</View>

				{trips.length === 0 ? (
					<View className='p-8 items-center gap-2'>
						<MaterialCommunityIcons name='folder-outline' size={34} color='#a1a1aa' />
						<Text className='text-zinc-500'>No completed trips yet.</Text>
					</View>
				) : (
					<View>
						{pagedTrips.map((trip) => (
							<View key={trip.id} className='p-4 border-b border-zinc-100 flex-row items-center justify-between'>
								<View className='flex-row items-center gap-3 flex-1 pr-2'>
									<View className='h-10 w-10 rounded-full bg-zinc-100 items-center justify-center'>
										<MaterialCommunityIcons name='map-marker-path' size={18} color='#71717a' />
									</View>
									<View className='flex-1'>
										<Text className='text-sm font-semibold text-zinc-900' numberOfLines={1}>
											{trip.route.name}
										</Text>
										<Text className='text-xs text-zinc-500 mt-1'>
											{new Date(trip.endTime).toLocaleDateString()} • {new Date(trip.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
										</Text>
									</View>
								</View>
								<View className='items-end gap-1'>
									<Text className='text-emerald-600 font-bold'>{formatCurrency(trip.totalAmount)}</Text>
									<View className='px-2 py-0.5 rounded-full bg-zinc-100'>
										<Text className='text-[10px] text-zinc-600'>{trip.passengers} passengers</Text>
									</View>
								</View>
							</View>
						))}

						{totalPages > 1 && (
							<View className='p-4 flex-row items-center justify-between'>
								<Pressable onPress={goPreviousPage} disabled={disablePrevious} className={`px-4 py-2 rounded-lg border ${disablePrevious ? "border-zinc-200 bg-zinc-100" : "border-zinc-300"}`}>
									<Text className='text-zinc-700 font-medium'>Previous</Text>
								</Pressable>
								<Text className='text-zinc-500'>
									Page {page} of {totalPages}
								</Text>
								<Pressable onPress={goNextPage} disabled={disableNext} className={`px-4 py-2 rounded-lg border ${disableNext ? "border-zinc-200 bg-zinc-100" : "border-zinc-300"}`}>
									<Text className='text-zinc-700 font-medium'>Next</Text>
								</Pressable>
							</View>
						)}
					</View>
				)}
			</View>
		</ScrollView>
	);
}
