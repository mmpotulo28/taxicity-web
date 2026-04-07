import { ExpoConfig } from "expo/config";

const appConfig: ExpoConfig = {
	name: "TaxiCiTi Driver",
	slug: "taxiciti-driver-app",
	version: "1.1.0",
	orientation: "portrait",
	icon: "./assets/icon.png",
	scheme: "taxiciti-driver-app",
	plugins: [
		"expo-router",
		"expo-font",
		"expo-web-browser",
		"expo-secure-store",
		"./plugins/withAndroidPackagingExcludes",
		[
			"@sentry/react-native/expo",
			{
				url: "https://sentry.io/",
				project: "taxiciti-driver-app",
				organization: "mpotulom",
			},
		],
	],
	experiments: {
		typedRoutes: true,
		reactCompiler: true,
	},
	userInterfaceStyle: "automatic",
	newArchEnabled: true,
	platforms: ["ios", "android"],
	splash: {
		image: "./assets/splash.png",
		resizeMode: "contain",
		backgroundColor: "#000000",
		imageWith: 150,
	},
	ios: {
		supportsTablet: false,
		bundleIdentifier: "com.taxiciti.driver",
		infoPlist: {
			NSLocationWhenInUseUsageDescription: "This app uses your location to receive trips nearby.",
		},
	},
	android: {
		adaptiveIcon: {
			foregroundImage: "./assets/adaptive-icon.png",
			backgroundColor: "#000000",
		},
		edgeToEdgeEnabled: true,
		package: "com.taxiciti.driver",
		// @ts-expect-error Expo config type does not expose this flag yet.
		usesCleartextTraffic: true,
	},
	web: {
		favicon: "./assets/favicon.png",
	},
	extra: {
		eas: {
			projectId: "1acdfaee-885c-4d9b-84b3-55255426118f",
		},
	},
	runtimeVersion: {
		policy: "appVersion",
	},
	updates: {
		url: "https://u.expo.dev/c910e9bb-ceb1-4059-ac92-05e8bb4b69c8",
	},
};

export default appConfig;
