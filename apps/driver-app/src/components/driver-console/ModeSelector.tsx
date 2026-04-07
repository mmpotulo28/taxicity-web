import { Pressable, Text, View } from "react-native";

export function ModeSelector({ mode, onChange }: Readonly<{ mode: "roaming" | "rank"; onChange: (mode: "roaming" | "rank") => void }>) {
	return (
		<View className='flex-row bg-slate-100 rounded-2xl p-2 gap-2 shadow-sm border border-slate-200'>
			<Pressable 
				onPress={() => onChange("roaming")} 
				className={`flex-1 py-3 rounded-xl items-center justify-center transition-all ${
					mode === "roaming" 
						? "bg-amber-400 shadow-md" 
						: "bg-transparent"
				}`}
			>
				<View className='flex-row items-center justify-center gap-2'>
					<Text className={`text-base font-bold ${mode === "roaming" ? "text-amber-900" : "text-slate-600"}`}>
						🌍 Roaming
					</Text>
				</View>
			</Pressable>
			<Pressable 
				onPress={() => onChange("rank")} 
				className={`flex-1 py-3 rounded-xl items-center justify-center transition-all ${
					mode === "rank" 
						? "bg-emerald-400 shadow-md" 
						: "bg-transparent"
				}`}
			>
				<View className='flex-row items-center justify-center gap-2'>
					<Text className={`text-base font-bold ${mode === "rank" ? "text-emerald-900" : "text-slate-600"}`}>
						📍 Rank Queue
					</Text>
				</View>
			</Pressable>
		</View>
	);
}
