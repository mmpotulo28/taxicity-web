import * as Sentry from "@sentry/react-native";
import NewRelic from "newrelic-react-native-agent";
import { Platform } from "react-native";

export const SENTRY_APPS_CONFIG: Sentry.ReactNativeOptions = {
	dsn: __DEV__ ? "https://spotlight@local/0" : "https://68617854ebc732dd7d8c2877131d3fa0@o4509553467064320.ingest.us.sentry.io/4510781908647936",

	// Adds more context data to events (IP address, cookies, user, etc.)
	// For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
	sendDefaultPii: true,

	// Enable Logs
	enableLogs: true,

	// Configure Session Replay
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1,
	integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	spotlight: __DEV__,
};

export const NEWRELIC_APPS_CONFIG = {
	appToken: Platform.OS === "ios" ? process.env.EXPO_PUBLIC_NEWRELIC_IOS_APP_TOKEN : process.env.EXPO_PUBLIC_NEWRELIC_ANDROID_APP_TOKEN,
	agentConfiguration: {
		//Android Specific
		// Optional:Enable or disable collection of event data.
		analyticsEventEnabled: true,

		// Optional:Enable or disable crash reporting.
		crashReportingEnabled: true,

		// Optional:Enable or disable interaction tracing. Trace
		// instrumentation still occurs, but no traces are harvested.This will disable default and custom interactions.
		interactionTracingEnabled: true,

		// Optional:Enable or disable reporting successful HTTP
		// requests to the MobileRequest event type.
		networkRequestEnabled: true,

		// Optional:Enable or disable reporting network and HTTP
		// request errors to the MobileRequestError event type.
		networkErrorRequestEnabled: true,

		// Optional:Enable or disable capture of HTTP response
		// bodies for HTTP error traces, and MobileRequestError events.
		httpResponseBodyCaptureEnabled: true,

		// Optional:Enable or disable agent logging.
		loggingEnabled: true,

		// Optional:Specifies the log level. Omit this field for the
		// default log level.
		// Options include: ERROR (least verbose), WARNING, INFO,
		// VERBOSE, AUDIT(most verbose).
		logLevel: NewRelic.LogLevel.INFO,

		// iOS Specific
		// Optional:Enable/Disable automatic instrumentation of
		// WebViews
		webViewInstrumentation: true,

		// Optional:Set a specific collector address for sending
		// data.Omit this field for default address.
		// collectorAddress: "",

		// Optional:Set a specific crash collector address for
		// sending crashes.Omit this field for default address.
		// crashCollectorAddress: ""
	},
};
