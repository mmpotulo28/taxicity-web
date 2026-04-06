import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useRideFunnel } from "../../src/features/ride/hooks/use-ride-funnel";

export default function TaxiListScreen() {
	const { taxisQuery, selectedRoute, pickupAddress, dropoffAddress, setSelectedTaxi, requestRideMutation } = useRideFunnel();
	const taxi = taxisQuery.data?.find((item) => (selectedRoute?.id ? item.routeId === selectedRoute.id : true)) || taxisQuery.data?.[0];

	const request = () => {
		if (!selectedRoute || !taxi) {
			return;
		}
		setSelectedTaxi(taxi);
		requestRideMutation.mutate(
			{
				routeId: selectedRoute.id,
				rankId: selectedRoute.rankId,
				pickupAddress: pickupAddress || "Taxi Rank Pickup",
				dropoffAddress: dropoffAddress || `${selectedRoute.name} Dropoff`,
				fare: Number(String(selectedRoute.estimatedFare).replace(/[^0-9.]/g, "")) || 0,
				paymentMethod: "CASH",
			},
			{
				onSuccess: () => {
					router.push("/(ride)/track");
				},
			},
		);
	};

	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-2 text-2xl font-bold text-white'>Available Taxi</Text>
			<Text className='mb-6 text-neutral-300'>
				{taxi ? `${taxi.driver} • ${taxi.model} • ${taxi.licensePlate}` : "Loading taxis..."}
			</Text>
			<Pressable className='rounded-md bg-brand px-5 py-3' onPress={request}>
				<Text className='font-semibold text-white'>{requestRideMutation.isPending ? "Requesting..." : "Request Ride"}</Text>
			</Pressable>
		</View>
	);
}
