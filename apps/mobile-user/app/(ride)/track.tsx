import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useRideFunnel } from "../../src/features/ride/hooks/use-ride-funnel";

export default function TrackRideScreen() {
	const { activeTrip, selectedTaxi, selectedRoute, pickupAddress, dropoffAddress, reset } = useRideFunnel();

	const startAnotherRide = () => {
		reset();
		router.replace("/(tabs)");
	};

	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-2 text-2xl font-bold text-white'>Track Ride</Text>
			<Text className='mb-1 text-neutral-300'>Status: {activeTrip?.status || "requested"}</Text>
			<Text className='mb-1 text-neutral-300'>Trip ID: {activeTrip?.id || "pending"}</Text>
			<Text className='mb-1 text-neutral-300'>Taxi: {selectedTaxi?.licensePlate || "pending assignment"}</Text>
			<Text className='mb-1 text-neutral-300'>Route: {selectedRoute?.name || "pending"}</Text>
			<Text className='mb-6 text-neutral-300'>
				{pickupAddress || "pickup"} → {dropoffAddress || "dropoff"}
			</Text>
			<View className='gap-3'>
				<Pressable className='rounded-md border border-neutral-600 px-5 py-3' onPress={() => router.push("/(tabs)/history")}>
					<Text className='text-center font-semibold text-white'>View Trip History</Text>
				</Pressable>
				<Pressable className='rounded-md bg-brand px-5 py-3' onPress={startAnotherRide}>
					<Text className='text-center font-semibold text-white'>Start Another Ride</Text>
				</Pressable>
			</View>
		</View>
	);
}
