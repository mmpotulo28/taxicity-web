import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, Pressable, Text, View } from "react-native";

const tabs = [
	{ name: "index", label: "Console", icon: "car-estate" as const },
	{ name: "earnings", label: "Earnings", icon: "wallet-outline" as const },
	{ name: "requests", label: "Requests", icon: "bell-outline" as const, main: true },
	{ name: "vehicle", label: "Vehicle", icon: "car-info" as const },
	{ name: "profile", label: "Profile", icon: "account-outline" as const },
];

function DriverTabBar({ state, descriptors, navigation }: Readonly<BottomTabBarProps>) {
	return (
		<View className='absolute bottom-0 left-0 right-0 px-4' style={{ paddingBottom: Platform.OS === "ios" ? 22 : 12 }}>
			<View className='rounded-3xl border border-zinc-200 bg-white/95 px-2 shadow-lg' style={{ shadowColor: "#0f172a", shadowOpacity: 0.16, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 10 }}>
				<View className='flex-row items-end justify-between h-20'>
					{tabs.map((tab, index) => {
						const route = state.routes.find((r) => r.name === tab.name);
						if (!route) return null;

						const routeIndex = state.routes.findIndex((r) => r.key === route.key);
						const isFocused = state.index === routeIndex;

						const onPress = () => {
							const event = navigation.emit({
								type: "tabPress",
								target: route.key,
								canPreventDefault: true,
							});

							if (!isFocused && !event.defaultPrevented) {
								navigation.navigate(route.name);
							}
						};

						const onLongPress = () => {
							navigation.emit({
								type: "tabLongPress",
								target: route.key,
							});
						};

						if (tab.main) {
							return (
								<Pressable key={tab.name} onPress={onPress} onLongPress={onLongPress} className='-mt-9 h-16 w-16 items-center justify-center rounded-full border-4 border-white shadow-lg' style={{ backgroundColor: "#f59e0b", shadowColor: "#f59e0b", shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 10 }}>
									<MaterialCommunityIcons name={tab.icon} size={24} color='#18181b' />
								</Pressable>
							);
						}

						return (
							<Pressable key={tab.name} onPress={onPress} onLongPress={onLongPress} className='flex-1 h-16 items-center justify-center'>
								<View className={`px-2.5 py-1 rounded-full ${isFocused ? "bg-amber-100" : "bg-transparent"}`}>
									<MaterialCommunityIcons name={tab.icon} size={20} color={isFocused ? "#d97706" : "#71717a"} />
								</View>
								<Text className={isFocused ? "text-[11px] text-amber-600 font-bold mt-1" : "text-[11px] text-zinc-500 mt-1"}>{tab.label}</Text>
							</Pressable>
						);
					})}
				</View>
			</View>
		</View>
	);
}

export default function TabsLayout() {
	return (
		<Tabs tabBar={(props) => <DriverTabBar {...props} />} screenOptions={{ headerShown: false }}>
			<Tabs.Screen name='index' options={{ title: "Console" }} />
			<Tabs.Screen name='earnings' options={{ title: "Earnings" }} />
			<Tabs.Screen name='requests' options={{ title: "Requests" }} />
			<Tabs.Screen name='vehicle' options={{ title: "Vehicle" }} />
			<Tabs.Screen name='profile' options={{ title: "Profile" }} />
		</Tabs>
	);
}
