import { Stack } from "expo-router";
import { AppProviders } from "../src/providers/AppProviders";
import "../global.css";

export default function RootLayout() {
	return (
		<AppProviders>
			<Stack
				screenOptions={{
					headerShown: false,
					contentStyle: { backgroundColor: "#f4f4f5" },
				}}>
				<Stack.Screen name='(onboarding)' />
				<Stack.Screen name='(auth)' />
				<Stack.Screen name='(tabs)' />
				<Stack.Screen name='apply' />
				<Stack.Screen name='status' />
				<Stack.Screen name='notifications' />
			</Stack>
		</AppProviders>
	);
}
