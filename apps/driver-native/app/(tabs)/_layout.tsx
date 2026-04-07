import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColorScheme } from "react-native";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const activeColor = colorScheme === "dark" ? "#fff" : "#000";

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: "#f31260", // primary color for HeroUI default
				tabBarInactiveTintColor: "#a1a1aa", // default-500
				tabBarStyle: {
					backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
					borderTopColor: colorScheme === "dark" ? "#27272a" : "#e4e4e7",
				},
			}}>
			<Tabs.Screen
				name='index'
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => <Feather name='home' size={24} color={color} />,
				}}
			/>
			<Tabs.Screen
				name='profile'
				options={{
					title: "Profile",
					tabBarIcon: ({ color }) => <Feather name='user' size={24} color={color} />,
				}}
			/>
		</Tabs>
	);
}
