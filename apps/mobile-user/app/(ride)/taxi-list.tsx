import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { TaxiDto } from "../../src/features/ride/dto/ride-funnel.dto";
import { useRideFunnel } from "../../src/features/ride/hooks/use-ride-funnel";

export default function TaxiListScreen() {
	const { taxisQuery, selectedRoute, pickupAddress, dropoffAddress, selectedTaxi, setSelectedTaxi, requestRideMutation } = useRideFunnel();
	const taxis = (taxisQuery.data || []).filter((item) => (selectedRoute?.id ? item.routeId === selectedRoute.id : true));
	const canRequest = Boolean(selectedRoute && selectedTaxi && pickupAddress.trim() && dropoffAddress.trim()) && !requestRideMutation.isPending;

	const request = () => {
		if (!selectedRoute || !selectedTaxi || !canRequest) {
			return;
		}
		requestRideMutation.mutate(
			{
				routeId: selectedRoute.id,
				rankId: selectedRoute.rankId,
				pickupAddress: pickupAddress.trim(),
				dropoffAddress: dropoffAddress.trim(),
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

	const renderTaxi = (taxi: TaxiDto) => {
		const isSelected = selectedTaxi?.id === taxi.id;
		return (
			<Pressable
				key={taxi.id}
				className={`rounded-md border px-4 py-3 ${isSelected ? "border-brand bg-brand/20" : "border-neutral-700"}`}
				onPress={() => setSelectedTaxi(taxi)}>
				<Text className='font-semibold text-white'>{taxi.driver}</Text>
				<Text className='text-sm text-neutral-300'>
					{taxi.model} • {taxi.licensePlate}
				</Text>
				<Text className='text-xs uppercase text-neutral-400'>{taxi.status}</Text>
			</Pressable>
		);
	};

	return (
		<View className='flex-1 bg-black px-6 pb-6 pt-12'>
			<Text className='mb-2 text-2xl font-bold text-white'>Available Taxis</Text>
			<Text className='mb-4 text-neutral-300'>{selectedRoute ? selectedRoute.name : "No route selected"}</Text>

			{taxisQuery.isLoading ? <Text className='text-neutral-300'>Loading taxis...</Text> : null}
			{taxisQuery.isError ? <Text className='text-red-400'>Unable to load taxis.</Text> : null}

			{!taxisQuery.isLoading && !taxisQuery.isError ? (
				<ScrollView className='mb-4' contentContainerClassName='gap-3'>
					{taxis.map(renderTaxi)}
					{taxis.length === 0 ? <Text className='text-neutral-300'>No taxis available for this route.</Text> : null}
				</ScrollView>
			) : null}

			{requestRideMutation.isError ? <Text className='mb-3 text-sm text-red-400'>Unable to request ride. Please try again.</Text> : null}
			<Pressable className={`rounded-md px-5 py-3 ${canRequest ? "bg-brand" : "bg-neutral-700"}`} onPress={request} disabled={!canRequest}>
				<Text className='font-semibold text-white'>{requestRideMutation.isPending ? "Requesting..." : "Request Ride"}</Text>
			</Pressable>
		</View>
	);
}
