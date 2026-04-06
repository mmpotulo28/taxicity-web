import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useRideFunnel } from "../../src/features/ride/hooks/use-ride-funnel";

export default function HomeTabScreen() {
	const { routesQuery, selectedRoute, setSelectedRoute } = useRideFunnel();
	const fallbackRoute = selectedRoute || routesQuery.data?.[0] || null;

	const onStartRide = () => {
		if (fallbackRoute) {
			setSelectedRoute(fallbackRoute);
		}
		router.push("/(ride)/route");
	};

	return (
		<View className='flex-1 items-center justify-center bg-black px-6'>
			<Text className='mb-4 text-2xl font-bold text-white'>TaxiCiTi</Text>
			<Text className='mb-2 text-center text-sm text-neutral-300'>Book your ride in a few quick steps.</Text>
			<Text className='mb-6 text-center text-xs text-neutral-400'>
				{routesQuery.isLoading
					? "Loading available routes..."
					: fallbackRoute
						? `Ready route: ${fallbackRoute.name}`
						: "No routes loaded yet. You can still open route selection."}
			</Text>
			<Pressable className='rounded-md bg-brand px-5 py-3' onPress={onStartRide}>
				<Text className='font-semibold text-white'>Start Ride</Text>
			</Pressable>
		</View>
	);
}
