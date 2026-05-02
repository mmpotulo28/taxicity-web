const appConfig = {
	name: "TaxiCiTi",
	slug: "taxiciti-app",
	version: "1.1.0",
	orientation: "portrait",
	icon: "./assets/icon.png",
	plugins: ["./plugins/withNewRelic.ts"],
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
};

export default appConfig;
