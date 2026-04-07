import { Stack } from "expo-router";

export default function AuthLayout() {
	return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#f4f4f5" } }} />;
}
