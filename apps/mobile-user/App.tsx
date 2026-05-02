import { StatusBar } from "expo-status-bar";
import { AppRegistry, Platform } from "react-native";
import { WebView } from "react-native-webview";

import { JSX, useEffect, useRef } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import NewRelic from "newrelic-react-native-agent";
import * as packageJson from "./package.json";
import * as Updates from "expo-updates";
import * as SplashScreen from "expo-splash-screen";
import { NEWRELIC_APPS_CONFIG } from "@taxiciti/configs/telemetry-mobile";
import { getHost } from "@taxiciti/utils";
import { styles } from "@taxiciti/ui/styles/app.styles";
import { WebViewErrorFallback } from "./components/WebViewErrorFallback";
import Constants from "expo-constants";

SplashScreen.preventAutoHideAsync();

let USER_APP_URL = getHost("user") || "";

if (__DEV__ && false) {
	const debuggerHost = Constants.expoConfig?.hostUri;

	if (debuggerHost) {
		USER_APP_URL = debuggerHost;
		console.log("Replaced localhost with device IP:", USER_APP_URL);
	}
}

console.log("Final Webview URL:", USER_APP_URL);

const App = (): JSX.Element => {
	const webViewRef = useRef<WebView>(null);

	useEffect(() => {
		if (__DEV__) return;
		Updates.checkForUpdateAsync()
			.then((update) => {
				if (update.isAvailable) {
					console.log("Update available, fetching update...");
					Updates.fetchUpdateAsync().then(() => {
						console.log("Update fetched, reloading app...");
						Updates.reloadAsync();
					});
				}
			})
			.catch((error) => {
				console.error("Error checking for updates:", error);
			});
	}, []);

	// Request location permissions on app start
	useEffect(() => {
		(async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				console.log("Permission to access location was denied");
			}
		})();
	}, []);

	const handleRetry = () => {
		if (webViewRef.current) {
			webViewRef.current.reload();
		}
	};

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.container} edges={["bottom"]}>
				<StatusBar style='auto' animated={true} backgroundColor='#000000' hidden={true} />
				<WebView
					allowsBackForwardNavigationGestures
					allowFileAccess
					ref={webViewRef}
					source={{ uri: USER_APP_URL }}
					style={styles.webview}
					onLoad={() => SplashScreen.hideAsync()}
					onError={() => console.error("WebView failed to load URL:", USER_APP_URL)}
					geolocationEnabled={true}
					webviewDebuggingEnabled={true}
					javaScriptEnabled={true}
					domStorageEnabled={true}
					startInLoadingState={true}
					renderError={(errorDomain, errorCode, errorDesc) => <WebViewErrorFallback errorDomain={errorDomain} errorCode={errorCode} errorDesc={errorDesc} onRetry={handleRetry} />}
				/>
			</SafeAreaView>
		</SafeAreaProvider>
	);
};

NewRelic.startAgent(NEWRELIC_APPS_CONFIG.appToken, NEWRELIC_APPS_CONFIG.agentConfiguration);
NewRelic.setJSAppVersion(packageJson.version);
AppRegistry.registerComponent(packageJson.name, () => App);

export default App;
