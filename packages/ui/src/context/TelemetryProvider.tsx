"use client";

import React, { createContext, useEffect, useRef, useContext } from 'react';
import { getWebInstrumentations, initializeFaro, Faro, ReactIntegration } from '@grafana/faro-react';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

const TelemetryContext = createContext<Faro | null>(null);

export interface TelemetryProviderProps {
 children: React.ReactNode;
 appName?: string;
 version?: string;
 environment?: string;
}

export function TelemetryProvider({
 children,
 appName = 'TaxiCiTi',
 version = '1.0.0',
 environment = 'production'
}: TelemetryProviderProps) {
 const faroRef = useRef<Faro | null>(null);

 // useEffect(() => {
 //  const faroUrl = process.env.NEXT_PUBLIC_FARO_URL || 'https://faro-collector-prod-us-west-0.grafana.net/collect/fa815a944aa7e6d985c968ab6d6977fe';

 //  if (typeof window === 'undefined' || faroRef.current || !faroUrl) return;

 //  // Check if we are in development mode to potentially avoid AdBlocker noise
 //  if (process.env.NODE_ENV === 'development') {
 //   console.log('Faro Telemetry initializing in development mode. If you see "Failed to fetch" errors, check your Ad Blocker.');
 //  }

 //  faroRef.current = initializeFaro({
 //   url: faroUrl,
 //   app: {
 //    name: appName,
 //    version: version,
 //    environment: environment
 //   },
 //   instrumentations: [
 //    // Mandatory, omits default instrumentations otherwise.
 //    ...getWebInstrumentations(),

 //    // Tracing package to get end-to-end visibility for HTTP requests.
 //    new TracingInstrumentation(),

 //    // React integration for React applications.
 //    new ReactIntegration(),
 //   ],
 //  });
 // }, [appName, version, environment]);

 return (
  <TelemetryContext.Provider value={faroRef.current}>
   {children}
  </TelemetryContext.Provider>
 );
}

export const useTelemetry = () => useContext(TelemetryContext);
