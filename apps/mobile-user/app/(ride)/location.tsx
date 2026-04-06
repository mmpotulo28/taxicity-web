import { router } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRideFunnel } from "../../src/features/ride/hooks/use-ride-funnel";

export default function RideLocationScreen() {
	const { pickupAddress, dropoffAddress, setPickupAddress, setDropoffAddress, selectedRoute } = useRideFunnel();

	const continueFlow = () => {
		if (!pickupAddress) {
			setPickupAddress("Taxi Rank Pickup");
		}
		if (!dropoffAddress) {
			setDropoffAddress(`${selectedRoute?.name || "Destination"} Dropoff`);
		}
		router.push("/(ride)/taxi-list");
	};

	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-4 text-2xl font-bold text-white'>Pickup & Dropoff</Text>
			<TextInput
				value={pickupAddress}
				onChangeText={setPickupAddress}
				placeholder='Pickup address'
				placeholderTextColor='#9ca3af'
				className='mb-3 rounded-md border border-neutral-700 px-4 py-3 text-white'
			/>
			<TextInput
				value={dropoffAddress}
				onChangeText={setDropoffAddress}
				placeholder='Dropoff address'
				placeholderTextColor='#9ca3af'
				className='mb-6 rounded-md border border-neutral-700 px-4 py-3 text-white'
			/>
			<Pressable className='rounded-md bg-brand px-5 py-3' onPress={continueFlow}>
				<Text className='font-semibold text-white'>Find Taxis</Text>
			</Pressable>
		</View>
	);
}
