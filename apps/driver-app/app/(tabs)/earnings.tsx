import { ScrollView, Text, View } from "react-native";

import { useDriverEarnings } from "../../src/features/earnings/hooks/use-earnings";
import { EmptyState, ErrorState, LoadingState } from "../../src/shared/ui/state-screen";

export default function EarningsTab() {
	const { data, isLoading, isError, error, refetch } = useDriverEarnings(true);

	if (isLoading) {
		return <LoadingState label='Loading earnings...' />;
	}

	if (isError) {
		return <ErrorState title='Earnings unavailable' message={error?.message ?? "Could not load earnings."} onRetry={() => void refetch()} />;
	}

	if (!data) {
		return <EmptyState title='No earnings yet' message='Complete trips to populate your earnings summary.' />;
	}

	if (data.trips.length === 0) {
		return (
			<View className='flex-1 bg-zinc-950 p-4'>
				<Text className='text-2xl font-semibold text-white'>Earnings</Text>
				<Text className='mt-2 text-zinc-300'>Total: R{data.total.toFixed(2)}</Text>
				<Text className='mt-1 text-zinc-400'>Today: R{data.today.toFixed(2)}</Text>
				<Text className='mt-1 text-zinc-400'>Week: R{data.week.toFixed(2)}</Text>
				<Text className='mt-1 text-zinc-400'>Month: R{data.month.toFixed(2)}</Text>
				<Text className='mt-1 text-zinc-400'>Amount due: R{data.amountDue.toFixed(2)}</Text>
				<EmptyState title='No completed trips' message='Your recent completed trips will appear here.' />
			</View>
		);
	}

	return (
		<ScrollView className='flex-1 bg-zinc-950' contentContainerStyle={{ padding: 16, gap: 12 }}>
			<Text className='text-2xl font-semibold text-white'>Earnings</Text>

			<View className='rounded-xl border border-zinc-800 bg-zinc-900 p-4'>
				<Text className='text-zinc-400'>Total earnings</Text>
				<Text className='mt-1 text-2xl font-semibold text-yellow-300'>R{data.total.toFixed(2)}</Text>
			</View>

			<View className='rounded-xl border border-zinc-800 bg-zinc-900 p-4'>
				<Text className='text-zinc-300'>Today: R{data.today.toFixed(2)}</Text>
				<Text className='mt-1 text-zinc-300'>Week: R{data.week.toFixed(2)}</Text>
				<Text className='mt-1 text-zinc-300'>Month: R{data.month.toFixed(2)}</Text>
				<Text className='mt-1 text-zinc-300'>Amount due: R{data.amountDue.toFixed(2)}</Text>
			</View>

			<Text className='mt-2 text-lg font-semibold text-white'>Recent completed trips</Text>
			{data.trips.map((trip) => (
				<View key={trip.id} className='rounded-xl border border-zinc-800 bg-zinc-900 p-4'>
					<Text className='text-base font-semibold text-white'>{trip.route.name}</Text>
					<Text className='mt-1 text-zinc-400'>Passengers: {trip.passengers}</Text>
					<Text className='mt-1 text-zinc-300'>Trip total: R{trip.totalAmount.toFixed(2)}</Text>
				</View>
			))}
		</ScrollView>
	);
}
