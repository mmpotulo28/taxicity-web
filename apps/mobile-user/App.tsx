import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform, AppRegistry } from 'react-native';
import { WebView } from 'react-native-webview';
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import NewRelic from 'newrelic-react-native-agent';
import * as packageJson from './package.json';
import * as Updates from 'expo-updates';

let appToken;

if (Platform.OS === 'ios') {
  appToken = process.env.EXPO_PUBLIC_NEWRELIC_IOS_APP_TOKEN;
} else {
  appToken = process.env.EXPO_PUBLIC_NEWRELIC_ANDROID_APP_TOKEN;
}

const agentConfiguration = {
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
};


NewRelic.startAgent(appToken, agentConfiguration);
NewRelic.setJSAppVersion(packageJson.version);
AppRegistry.registerComponent(packageJson.name, () => App);



// Always use HTTPS for your production domain to avoid cleartext errors on Android
const getHost = () => {
  const host = 'https://taxicity.mpotulo.com';
  console.log('Using host:', host);
  return host;
};

const USER_APP_URL = getHost();;

export default function App() {


  useEffect(() => {
    Updates.checkForUpdateAsync().then((update) => {
      if (update.isAvailable) {
        console.log('Update available, fetching update...');
        Updates.fetchUpdateAsync().then(() => {
          console.log('Update fetched, reloading app...');
          Updates.reloadAsync();
        });
      }
    });
  }, []);

  // Request location permissions on app start
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["bottom"]} >
        <StatusBar style="auto" animated={true} backgroundColor="#000000" hidden={true} />
        <WebView
          source={{ uri: USER_APP_URL }}
          style={styles.webview}
          geolocationEnabled={true}
          webviewDebuggingEnabled={true}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,

    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
