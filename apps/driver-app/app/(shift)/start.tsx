import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

import { useStartShift } from "../../src/features/shift/hooks/use-shift";

export default function ShiftStartScreen() {
	const [taxiId, setTaxiId] = useState("");
	const [routeId, setRouteId] = useState("");
	const startShift = useStartShift();

	const onStart = async () => {
		await startShift.mutateAsync({ taxiId, routeId });
		router.replace("/(shift)/active");
	};

	return (
		<View className='flex-1 bg-zinc-950 px-6 pt-20'>
			<Text className='text-2xl font-bold text-white'>Start shift</Text>
			<Text className='mt-2 text-zinc-400'>Select taxi and route to go online.</Text>

			<View className='mt-8 gap-3'>
				<TextInput value={taxiId} onChangeText={setTaxiId} placeholder='Taxi ID' placeholderTextColor='#71717A' className='rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white' />
				<TextInput value={routeId} onChangeText={setRouteId} placeholder='Route ID' placeholderTextColor='#71717A' className='rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white' />
			</View>

			{startShift.isError ? <Text className='mt-3 text-red-400'>{startShift.error?.message ?? "Unable to start shift"}</Text> : null}

			<Pressable onPress={onStart} disabled={startShift.isPending} className='mt-6 items-center rounded-xl bg-yellow-400 px-4 py-3'>
				<Text className='font-semibold text-zinc-900'>{startShift.isPending ? "Starting..." : "Start shift"}</Text>
			</Pressable>
		</View>
	);
}
