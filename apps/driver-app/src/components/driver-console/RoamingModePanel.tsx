import { Pressable, ScrollView, Text, View } from "react-native";

export function RoamingModePanel({
	routes,
	selectedRouteId,
	busy,
	onSelectRoute,
	onStart,
}: Readonly<{
	routes: { id: string; name: string }[];
	selectedRouteId: string;
	busy: boolean;
	onSelectRoute: (id: string) => void;
	onStart: () => void;
}>) {
	return (
		<View className='gap-4 mt-2'>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName='gap-2'>
				{routes.map((route) => {
					const active = selectedRouteId === route.id;
					return (
						<Pressable 
							key={route.id} 
							onPress={() => onSelectRoute(route.id)} 
							className={`px-4 py-3 rounded-2xl border-2 shadow-sm transition-all ${
								active 
									? "bg-amber-400 border-amber-500" 
									: "bg-slate-50 border-slate-300"
							}`}
						>
							<Text className={`font-bold text-base ${active ? "text-amber-900" : "text-slate-700"}`}>
								🚏 {route.name}
							</Text>
						</Pressable>
					);
				})}
			</ScrollView>
			<Pressable 
				onPress={onStart} 
				disabled={!selectedRouteId || busy} 
				className={`rounded-2xl py-4 items-center justify-center border-b-4 transition-all shadow-md mt-2 ${
					!selectedRouteId || busy
						? "bg-slate-300 border-slate-400"
						: "bg-emerald-500 border-emerald-700"
				}`}
			>
				<Text className={`font-bold text-lg ${!selectedRouteId || busy ? "text-slate-500" : "text-white"}`}>
					{busy ? "🔄 Starting..." : "✨ Go Online"}
				</Text>
			</Pressable>
		</View>
	);
}
