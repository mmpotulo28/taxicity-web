import { Pressable, Text, View } from "react-native";
import { useRideFunnel } from "../../src/features/ride/hooks/use-ride-funnel";

export default function TrackRideScreen() {
	const { activeTrip, selectedTaxi, reset } = useRideFunnel();

	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-2 text-2xl font-bold text-white'>Track Ride</Text>
			<Text className='mb-2 text-neutral-300'>Trip: {activeTrip?.id || "Pending assignment"}</Text>
			<Text className='mb-6 text-neutral-300'>Taxi: {selectedTaxi?.licensePlate || "Pending assignment"}</Text>
			<Pressable className='rounded-md border border-neutral-600 px-5 py-3' onPress={reset}>
				<Text className='font-semibold text-white'>Reset Ride Funnel</Text>
			</Pressable>
		</View>
	);
}
