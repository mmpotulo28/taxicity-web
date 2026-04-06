import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useRideFunnel } from "../../src/features/ride/hooks/use-ride-funnel";

export default function HomeTabScreen() {
	const { routesQuery, setSelectedRoute } = useRideFunnel();
	const firstRoute = routesQuery.data?.[0] || null;

	const onStartRide = () => {
		if (firstRoute) {
			setSelectedRoute(firstRoute);
		}
		router.push("/(ride)/route");
	};

	return (
		<View className='flex-1 items-center justify-center bg-black px-6'>
			<Text className='mb-4 text-2xl font-bold text-white'>TaxiCiTi</Text>
			<Text className='mb-6 text-center text-sm text-neutral-300'>
				Native ride funnel foundation is active.
			</Text>
			<Pressable className='rounded-md bg-brand px-5 py-3' onPress={onStartRide}>
				<Text className='font-semibold text-white'>Start Ride</Text>
			</Pressable>
		</View>
	);
}
