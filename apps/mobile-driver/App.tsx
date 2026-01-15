import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useState } from 'react';

// Configuration - to be moved to env vars later
const DRIVER_APP_URL = 'https://taxicity-driver.vercel.app';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <WebView
        source={{ uri: DRIVER_APP_URL }}
        style={styles.webview}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      )}
    </View>
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
    backgroundColor: 'white',
  },
});
