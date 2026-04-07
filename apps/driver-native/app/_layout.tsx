import "../src/styles/global.css";
import { Stack } from "expo-router";

import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<HeroUINativeProvider>
				<Stack screenOptions={{ headerShown: false }} />
			</HeroUINativeProvider>
		</GestureHandlerRootView>
	);
}
