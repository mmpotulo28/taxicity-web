import { Pressable, ScrollView, Text, View } from "react-native";
import type { DriverProfile } from "../../modules/driver-console/useDriverConsole";

export function VehiclePicker({
	taxis,
	selectedTaxiId,
	onSelect,
}: Readonly<{
	taxis: DriverProfile["taxis"];
	selectedTaxiId: string;
	onSelect: (id: string) => void;
}>) {
	return (
		<View className='rounded-3xl bg-white border-2 border-slate-200 p-5 gap-3 shadow-md'>
			<View className='flex-row items-center gap-2'>
				<Text className='text-2xl'>🚕</Text>
				<Text className='text-xl font-bold text-slate-900'>Select Your Taxi</Text>
			</View>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName='gap-2'>
				{taxis.map((taxi) => {
					const active = selectedTaxiId === taxi.id;
					return (
						<Pressable 
							key={taxi.id} 
							onPress={() => onSelect(taxi.id)} 
							className={`px-4 py-3 rounded-2xl border-2 shadow-sm transition-all ${
								active 
									? "bg-amber-400 border-amber-500" 
									: "bg-slate-50 border-slate-300"
							}`}
						>
							<Text className={`font-bold text-base ${active ? "text-amber-900" : "text-slate-700"}`}>
								🔷 {taxi.licensePlate}
							</Text>
							<Text className={`text-xs font-semibold mt-1 flex-1 ${active ? "text-amber-800" : "text-slate-500"}`}>
								{taxi.make} {taxi.model}
							</Text>
						</Pressable>
					);
				})}
			</ScrollView>
		</View>
	);
}
