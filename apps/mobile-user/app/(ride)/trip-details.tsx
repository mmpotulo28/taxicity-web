import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useState } from "react";
import { useTripDetails } from "../../src/features/ride/hooks/use-trip-history";

export default function TripDetailsScreen() {
	const { tripId } = useLocalSearchParams<{ tripId?: string }>();
	const [rating, setRating] = useState(5);
	const { tripQuery, rateTripMutation } = useTripDetails(tripId || "");
	const trip = tripQuery.data;

	const submitRating = () => {
		if (!tripId) {
			return;
		}
		rateTripMutation.mutate(rating);
	};

	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-4 text-2xl font-bold text-white'>Trip Details</Text>
			{trip ? (
				<>
					<Text className='text-neutral-200'>{trip.route}</Text>
					<Text className='mt-2 text-neutral-300'>
						{trip.pickup} → {trip.dropoff}
					</Text>
					<Text className='mt-2 text-neutral-300'>Driver: {trip.driver}</Text>
					<Text className='mt-2 text-neutral-300'>Vehicle: {trip.vehicle}</Text>
					<Text className='mt-2 text-brand'>Fare: {trip.fare}</Text>
					<View className='mt-6 flex-row gap-2'>
						{[1, 2, 3, 4, 5].map((star) => (
							<Pressable
								key={star}
								className={`rounded-md border px-3 py-2 ${rating >= star ? "border-brand bg-brand/20" : "border-neutral-700"}`}
								onPress={() => setRating(star)}
							>
								<Text className='text-white'>{star}</Text>
							</Pressable>
						))}
					</View>
					<Pressable className='mt-4 rounded-md bg-brand px-5 py-3' onPress={submitRating}>
						<Text className='font-semibold text-white'>{rateTripMutation.isPending ? "Submitting..." : "Submit Rating"}</Text>
					</Pressable>
				</>
			) : (
				<Text className='text-neutral-400'>{tripQuery.isLoading ? "Loading trip..." : "Trip not found."}</Text>
			)}
			<Pressable className='mt-4 rounded-md border border-neutral-700 px-5 py-3' onPress={() => router.back()}>
				<Text className='font-semibold text-white'>Back</Text>
			</Pressable>
		</View>
	);
}
