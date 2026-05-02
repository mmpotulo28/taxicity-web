import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import appConfig from "../app.config";

interface WebViewErrorFallbackProps {
 errorDomain?: string | null;
 errorCode?: number;
 errorDesc?: string;
 onRetry: () => void;
}

export const WebViewErrorFallback = ({
 errorDomain,
 errorCode,
 errorDesc,
 onRetry,
}: WebViewErrorFallbackProps) => {
 const [showDetails, setShowDetails] = useState(false);

 return (
  <SafeAreaView style={styles.container}>
   <ScrollView contentContainerStyle={styles.contentContainer}>
    {/* Icon Container */}
    <View style={styles.iconContainer}>
     <Feather name="wifi-off" size={64} color="#FACC15" />
    </View>

    {/* Main Text */}
    <Text style={styles.title}>{errorDomain || "Error Loading Content"}</Text>
    <Text style={styles.description}>
     We couldn't reach the {appConfig.name} servers. Please check your internet connection.
    </Text>

    {/* Retry Button */}
    <TouchableOpacity
     style={styles.button}
     onPress={onRetry}
     activeOpacity={0.8}
    >
     <Feather name="refresh-cw" size={20} color="#000000" style={styles.buttonIcon} />
     <Text style={styles.buttonText}>Try Again</Text>
    </TouchableOpacity>

    {/* Technical Details Toggle */}
    {(errorCode || errorDesc) && (
     <View style={styles.detailsContainer}>
      <TouchableOpacity
       onPress={() => setShowDetails(!showDetails)}
       style={styles.detailsToggle}
      >
       <Text style={styles.detailsToggleText}>
        {showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
       </Text>
       <Feather
        name={showDetails ? "chevron-up" : "chevron-down"}
        size={16}
        color="#71717A"
       />
      </TouchableOpacity>

      {showDetails && (
       <View style={styles.technicalBox}>
        <View style={styles.techRow}>
         <MaterialIcons name="error-outline" size={16} color="#EF4444" style={styles.techIcon} />
         <Text style={styles.techLabel}>Error Code:</Text>
         <Text style={styles.techValue}>{errorCode}</Text>
        </View>
        {errorDomain && (
         <View style={styles.techRow}>
          <MaterialIcons name="domain" size={16} color="#71717A" style={styles.techIcon} />
          <Text style={styles.techLabel}>Domain:</Text>
          <Text style={styles.techValue}>{errorDomain}</Text>
         </View>
        )}
        <Text style={styles.techDesc}>{errorDesc}</Text>
       </View>
      )}
     </View>
    )}
   </ScrollView>

   {/* Footer / Help Link could go here */}
   <View style={styles.footer}>
    <Text style={styles.footerText}>Need help? Contact Support</Text>
   </View>
  </SafeAreaView>
 );
};

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: '#09090B', // Zinc-950 (Darker than pure black, looks more modern)
  minHeight: '100%',
 },
 contentContainer: {
  flexGrow: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 32,
 },
 iconContainer: {
  width: 120,
  height: 120,
  backgroundColor: 'rgba(250, 204, 21, 0.1)', // Yellow with low opacity
  borderRadius: 60,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 32,
  borderWidth: 1,
  borderColor: 'rgba(250, 204, 21, 0.2)',
 },
 title: {
  fontSize: 28,
  fontWeight: '800', // Extra Bold
  color: '#FFFFFF',
  marginBottom: 12,
  textAlign: 'center',
  letterSpacing: 0.5,
 },
 description: {
  fontSize: 16,
  color: '#A1A1AA', // Zinc-400
  textAlign: 'center',
  marginBottom: 48,
  lineHeight: 24,
  maxWidth: '85%',
 },
 button: {
  backgroundColor: '#FACC15', // Taxi Yellow
  paddingHorizontal: 32,
  paddingVertical: 18,
  borderRadius: 16, // Modern rounded corners
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#FACC15',
  shadowOffset: {
   width: 0,
   height: 4,
  },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 4,
 },
 buttonIcon: {
  marginRight: 10,
 },
 buttonText: {
  color: '#000000',
  fontWeight: '700',
  fontSize: 18,
  letterSpacing: 0.5,
 },
 detailsContainer: {
  marginTop: 48,
  width: '100%',
  alignItems: 'center',
 },
 detailsToggle: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 8,
 },
 detailsToggleText: {
  color: '#71717A', // Zinc-500
  fontSize: 14,
  marginRight: 6,
  fontWeight: '500',
 },
 technicalBox: {
  marginTop: 16,
  padding: 16,
  backgroundColor: '#18181B', // Zinc-900
  borderRadius: 12,
  width: '100%',
  borderWidth: 1,
  borderColor: '#27272A', // Zinc-800
 },
 techRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
 },
 techIcon: {
  marginRight: 8,
 },
 techLabel: {
  color: '#A1A1AA',
  fontSize: 12,
  marginRight: 6,
  fontWeight: '600',
 },
 techValue: {
  color: '#E4E4E7',
  fontSize: 12,
  fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
 },
 techDesc: {
  color: '#EF4444', // Red-500 for the error message itself
  fontSize: 12,
  marginTop: 8,
  lineHeight: 18,
  fontStyle: 'italic',
 },
 footer: {
  padding: 16,
  alignItems: 'center',
 },
 footerText: {
  color: '#52525B', // Zinc-600
  fontSize: 12,
 }
});
