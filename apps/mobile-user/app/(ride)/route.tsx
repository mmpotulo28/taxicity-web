import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRideFunnel } from "../../src/features/ride/hooks/use-ride-funnel";

export default function RideRouteScreen() {
	const { selectedRoute, routesQuery, setSelectedRoute } = useRideFunnel();

	const continueFlow = () => {
		if (!selectedRoute) {
			return;
		}
		router.push("/(ride)/location");
	};

	return (
		<View className='flex-1 bg-black px-6 pb-6 pt-12'>
			<Text className='mb-2 text-2xl font-bold text-white'>Select Route</Text>
			<Text className='mb-4 text-neutral-300'>Pick your route before entering pickup and dropoff.</Text>

			{routesQuery.isLoading ? <Text className='text-neutral-300'>Loading routes...</Text> : null}
			{routesQuery.isError ? <Text className='text-red-400'>Unable to load routes.</Text> : null}

			{!routesQuery.isLoading && !routesQuery.isError ? (
				<ScrollView className='mb-4' contentContainerClassName='gap-3'>
					{(routesQuery.data || []).map((route) => {
						const isSelected = selectedRoute?.id === route.id;
						return (
							<Pressable
								key={route.id}
								className={`rounded-md border px-4 py-3 ${isSelected ? "border-brand bg-brand/20" : "border-neutral-700"}`}
								onPress={() => setSelectedRoute(route)}>
								<Text className='font-semibold text-white'>{route.name}</Text>
								<Text className='text-sm text-neutral-300'>{route.estimatedFare}</Text>
							</Pressable>
						);
					})}
					{(routesQuery.data || []).length === 0 ? <Text className='text-neutral-300'>No routes available.</Text> : null}
				</ScrollView>
			) : null}

			<Pressable
				className={`rounded-md px-5 py-3 ${selectedRoute ? "bg-brand" : "bg-neutral-700"}`}
				onPress={continueFlow}
				disabled={!selectedRoute}>
				<Text className='font-semibold text-white'>Continue</Text>
			</Pressable>
		</View>
	);
}
