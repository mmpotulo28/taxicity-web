import { ExpoConfig } from "expo/config";

const appConfig: ExpoConfig = {
	name: "TaxiCiTi",
	slug: "taxiciti-app",
	version: "1.1.0",
	orientation: "portrait",
	icon: "./assets/icon.png",
	plugins: [
		"./plugins/withNewRelic.ts",
		[
			"@sentry/react-native/expo",
			{
				url: "https://sentry.io/",
				project: "taxyciti-app",
				organization: "mpotulom",
			},
		],
	],
	userInterfaceStyle: "dark",
	newArchEnabled: true,
	platforms: ["ios", "android"],
	splash: {
		image: "./assets/splash.png",
		resizeMode: "contain",
		backgroundColor: "#000000",
		imageWith: 150,
	},
	ios: {
		supportsTablet: true,
		bundleIdentifier: "com.taxiciti.user",
		infoPlist: {
			NSLocationWhenInUseUsageDescription: "This app uses your location to find nearby taxis and track your trip.",
		},
	},
	android: {
		adaptiveIcon: {
			foregroundImage: "./assets/adaptive-icon.png",
			backgroundColor: "#000000",
		},
		edgeToEdgeEnabled: true,
		package: "com.taxiciti.user",
		// @ts-ignore
		usesCleartextTraffic: true,
	},

	web: {
		favicon: "./assets/favicon.png",
	},
	extra: {
		eas: {
			projectId: "acb13b26-3032-49fe-848e-204cf313cde0",
		},
	},
	runtimeVersion: {
		policy: "appVersion",
	},
	updates: {
		url: "https://u.expo.dev/44d6dd98-69c1-4647-aae1-f33414efcc6e",
	},
};

export default appConfig;
