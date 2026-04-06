import { router } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useMemo, useState } from "react";
import { useTripHistory } from "../../src/features/ride/hooks/use-trip-history";

export default function HistoryTabScreen() {
	const [searchQuery, setSearchQuery] = useState("");
	const { tripsQuery } = useTripHistory();
	const filteredTrips = useMemo(() => {
		const trips = tripsQuery.data || [];
		const query = searchQuery.trim().toLowerCase();
		if (!query) {
			return trips;
		}
		return trips.filter((trip) => {
			return (
				trip.route.toLowerCase().includes(query) ||
				trip.pickup.toLowerCase().includes(query) ||
				trip.dropoff.toLowerCase().includes(query) ||
				trip.driver.toLowerCase().includes(query)
			);
		});
	}, [searchQuery, tripsQuery.data]);

	return (
		<View className='flex-1 bg-black px-4 pt-12'>
			<Text className='mb-3 text-2xl font-bold text-white'>Your Trips</Text>
			<Pressable className='mb-3 self-start rounded-md border border-neutral-700 px-4 py-2' onPress={() => tripsQuery.refetch()}>
				<Text className='text-white'>{tripsQuery.isFetching ? "Refreshing..." : "Refresh"}</Text>
			</Pressable>
			<TextInput
				value={searchQuery}
				onChangeText={setSearchQuery}
				placeholder='Search route, location, or driver'
				placeholderTextColor='#9ca3af'
				className='mb-4 rounded-md border border-neutral-700 px-4 py-3 text-white'
			/>
			{tripsQuery.isLoading ? (
				<Text className='text-neutral-400'>Loading trip history...</Text>
			) : tripsQuery.isError ? (
				<View className='rounded-md border border-red-800 bg-red-950/40 p-4'>
					<Text className='text-red-300'>Failed to load trip history.</Text>
					<Text className='mt-1 text-xs text-red-200'>Please check your connection and retry.</Text>
					<Pressable className='mt-3 rounded-md border border-red-700 px-4 py-2' onPress={() => tripsQuery.refetch()}>
						<Text className='text-white'>Retry</Text>
					</Pressable>
				</View>
			) : (
				<ScrollView className='flex-1'>
					{filteredTrips.length === 0 ? (
						<Text className='text-neutral-400'>No trips found.</Text>
					) : (
						filteredTrips.map((trip) => (
							<Pressable
								key={trip.id}
								className='mb-3 rounded-md border border-neutral-700 bg-neutral-900 p-4'
								onPress={() => router.push(`/(ride)/trip-details?tripId=${trip.id}`)}
							>
								<Text className='text-base font-semibold text-white'>{trip.route}</Text>
								<Text className='mt-1 text-sm text-neutral-300'>
									{trip.date} • {trip.time}
								</Text>
								<Text className='mt-1 text-xs text-neutral-400'>
									{trip.pickup} → {trip.dropoff}
								</Text>
								<Text className='mt-2 text-sm text-brand'>{trip.fare}</Text>
							</Pressable>
						))
					)}
				</ScrollView>
			)}
		</View>
	);
}
