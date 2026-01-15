import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

// Configuration
// On Android Emulator, localhost refers to the device itself.
// Use 10.0.2.2 for Android Emulator, or your machine's LAN IP (192.168.18.246) for physical devices.
const getHost = () => {
  if (Platform.OS === 'android') {
    // Use 10.0.2.2 for Android Emulator to reach host's localhost
    // Or use the explicit IP: '192.168.18.246'
    return '192.168.18.246';
  }
  return 'localhost';
};

const USER_APP_URL = `http://${getHost()}:3000`; // Dev URL
// const USER_APP_URL = 'https://taxicity.mpotulo.com'; // Prod URL

export default function App() {

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
