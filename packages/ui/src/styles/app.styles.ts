import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	webview: {
		flex: 1,
	},
	loadingContainer: {
		...StyleSheet.absoluteFillObject,

		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "transparent",
	},
});
