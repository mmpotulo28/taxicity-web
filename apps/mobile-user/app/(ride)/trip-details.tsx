import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTripDetails } from "../../src/features/ride/hooks/use-trip-history";

export default function TripDetailsScreen() {
	const { tripId } = useLocalSearchParams<{ tripId?: string }>();
	const [rating, setRating] = useState(5);
	const [submitted, setSubmitted] = useState(false);
	const { tripQuery, rateTripMutation } = useTripDetails(tripId || "");
	const trip = tripQuery.data;

	const submitRating = () => {
		if (!tripId || !trip || rateTripMutation.isPending || submitted) {
			return;
		}
		rateTripMutation.mutate(rating, {
			onSuccess: () => setSubmitted(true),
		});
	};

	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-4 text-2xl font-bold text-white'>Trip Details</Text>
			{tripQuery.isLoading ? <Text className='text-neutral-400'>Loading trip...</Text> : null}
			{tripQuery.isError ? <Text className='text-red-400'>Unable to load trip details.</Text> : null}
			{trip ? (
				<>
					<Text className='text-neutral-200'>{trip.route}</Text>
					<Text className='mt-2 text-neutral-300'>
						{trip.pickup} → {trip.dropoff}
					</Text>
					<Text className='mt-2 text-neutral-300'>Driver: {trip.driver}</Text>
					<Text className='mt-2 text-neutral-300'>Vehicle: {trip.vehicle}</Text>
					<Text className='mt-2 text-neutral-300'>Status: {trip.status}</Text>
					<Text className='mt-2 text-brand'>Fare: {trip.fare}</Text>
					<View className='mt-6 flex-row gap-2'>
						{[1, 2, 3, 4, 5].map((star) => (
							<Pressable
								key={star}
								className={`rounded-md border px-3 py-2 ${rating >= star ? "border-brand bg-brand/20" : "border-neutral-700"}`}
								onPress={() => setRating(star)}
								disabled={submitted || rateTripMutation.isPending}>
								<Text className='text-white'>{star}</Text>
							</Pressable>
						))}
					</View>

					{rateTripMutation.isError ? <Text className='mt-3 text-red-400'>Rating failed. Please retry.</Text> : null}
					{submitted ? <Text className='mt-3 text-brand'>Thanks! Your rating was submitted.</Text> : null}

					<Pressable
						className={`mt-4 rounded-md px-5 py-3 ${submitted ? "bg-neutral-700" : "bg-brand"}`}
						onPress={submitRating}
						disabled={submitted || rateTripMutation.isPending}>
						<Text className='font-semibold text-white'>
							{submitted ? "Rating Submitted" : rateTripMutation.isPending ? "Submitting..." : "Submit Rating"}
						</Text>
					</Pressable>
				</>
			) : null}
			{!tripQuery.isLoading && !tripQuery.isError && !trip ? <Text className='text-neutral-400'>Trip not found.</Text> : null}
			<Pressable className='mt-4 rounded-md border border-neutral-700 px-5 py-3' onPress={() => router.back()}>
				<Text className='font-semibold text-white'>Back</Text>
			</Pressable>
		</View>
	);
}
