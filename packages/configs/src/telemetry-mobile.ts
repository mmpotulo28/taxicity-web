import NewRelic from "newrelic-react-native-agent";
import { Platform } from "react-native";

export const NEWRELIC_APPS_CONFIG = {
	appToken: Platform.OS === "ios" ? process.env.EXPO_PUBLIC_NEWRELIC_IOS_APP_TOKEN : process.env.EXPO_PUBLIC_NEWRELIC_ANDROID_APP_TOKEN,
	agentConfiguration: {
		analyticsEventEnabled: true,
		crashReportingEnabled: true,
		interactionTracingEnabled: true,
		networkRequestEnabled: true,
		networkErrorRequestEnabled: true,
		httpResponseBodyCaptureEnabled: true,
		loggingEnabled: true,
		logLevel: NewRelic.LogLevel.INFO,
		webViewInstrumentation: true,
	},
};
