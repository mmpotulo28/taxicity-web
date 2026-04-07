import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function EndShiftSummaryScreen() {
	const params = useLocalSearchParams<{
		shiftId?: string;
		shiftStatus?: string;
		routeName?: string;
		taxiPlate?: string;
	}>();

	const shiftStatus = params.shiftStatus ?? "COMPLETED";
	const routeName = params.routeName ?? "Unknown route";
	const taxiPlate = params.taxiPlate ?? "Unknown taxi";

	return (
		<View className='flex-1 bg-zinc-950 p-4'>
			<Text className='text-2xl font-semibold text-white'>Shift ended</Text>
			<Text className='mt-2 text-zinc-300'>Status: {shiftStatus}</Text>
			<Text className='mt-1 text-zinc-400'>Route: {routeName}</Text>
			<Text className='mt-1 text-zinc-400'>Taxi: {taxiPlate}</Text>
			{params.shiftId ? <Text className='mt-1 text-zinc-500'>Shift ID: {params.shiftId}</Text> : null}

			<View className='mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4'>
				<Text className='text-zinc-300'>Closeout totals are now sourced from shift completion output. Earnings breakdown can be reviewed in the earnings tab.</Text>
			</View>
		</View>
	);
}
