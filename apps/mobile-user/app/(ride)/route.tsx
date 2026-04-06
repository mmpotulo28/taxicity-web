import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useRideFunnel } from "../../src/features/ride/hooks/use-ride-funnel";

export default function RideRouteScreen() {
	const { selectedRoute, routesQuery, setSelectedRoute } = useRideFunnel();
	const fallbackRoute = routesQuery.data?.[0] || null;
	const routeToUse = selectedRoute || fallbackRoute;

	const continueFlow = () => {
		if (routeToUse) {
			setSelectedRoute(routeToUse);
		}
		router.push("/(ride)/location");
	};

	return (
		<View className='flex-1 justify-center bg-black px-6'>
			<Text className='mb-2 text-2xl font-bold text-white'>Select Route</Text>
			<Text className='mb-6 text-neutral-300'>
				{routeToUse ? `${routeToUse.name} • ${routeToUse.estimatedFare}` : "Loading routes..."}
			</Text>
			<Pressable className='rounded-md bg-brand px-5 py-3' onPress={continueFlow}>
				<Text className='font-semibold text-white'>Continue</Text>
			</Pressable>
		</View>
	);
}
