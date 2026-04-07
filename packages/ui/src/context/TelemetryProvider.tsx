"use client";

import React, { createContext, useContext } from "react";
import { Faro } from "@grafana/faro-react";

const TelemetryContext = createContext<Faro | null>(null);

export interface TelemetryProviderProps {
	children: React.ReactNode;
	appName?: string;
	version?: string;
	environment?: string;
}

export function TelemetryProvider({ children, appName = "TaxiCiTi", version = "1.0.0", environment = "production" }: TelemetryProviderProps) {
	return <TelemetryContext.Provider value={null}>{children}</TelemetryContext.Provider>;
}

export const useTelemetry = () => useContext(TelemetryContext);
