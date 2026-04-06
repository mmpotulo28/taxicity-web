import { router } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRideFunnel } from "../../src/features/ride/hooks/use-ride-funnel";

export default function RideLocationScreen() {
	const { pickupAddress, dropoffAddress, setPickupAddress, setDropoffAddress, selectedRoute } = useRideFunnel();
	const canContinue = pickupAddress.trim().length > 2 && dropoffAddress.trim().length > 2;

	const continueFlow = () => {
		if (!canContinue) {
			return;
		}
		router.push("/(ride)/taxi-list");
	};

	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-2 text-2xl font-bold text-white'>Pickup & Dropoff</Text>
			<Text className='mb-4 text-neutral-300'>Route: {selectedRoute?.name || "Not selected"}</Text>
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
				className='mb-3 rounded-md border border-neutral-700 px-4 py-3 text-white'
			/>
			{!canContinue ? <Text className='mb-3 text-xs text-neutral-400'>Enter both addresses to continue.</Text> : null}
			<Pressable className={`rounded-md px-5 py-3 ${canContinue ? "bg-brand" : "bg-neutral-700"}`} onPress={continueFlow} disabled={!canContinue}>
				<Text className='font-semibold text-white'>Find Taxis</Text>
			</Pressable>
		</View>
	);
}
