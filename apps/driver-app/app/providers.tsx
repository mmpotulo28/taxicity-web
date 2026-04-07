"use client";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/toast";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkConfig } from "@taxiciti/configs/clerk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MapProvider, PusherProvider, TelemetryProvider } from "@taxiciti/ui";

import { type ThemeProviderProps } from "next-themes"; // Correct import for types
import { DriverProvider } from "@/src/context/DriverContext";

const queryClient = new QueryClient();

export interface ProvidersProps {
	children: React.ReactNode;
	themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
	interface RouterConfig {
		routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
	}
}

export function Providers({ children, themeProps }: Readonly<ProvidersProps>) {
	const router = useRouter();

	return (
		<ClerkProvider {...clerkConfig}>
			<TelemetryProvider appName='TaxiCiTi Driver' version='1.0.0'>
				<QueryClientProvider client={queryClient}>
					<HeroUIProvider navigate={router.push}>
						<NextThemesProvider {...themeProps}>
							<PusherProvider role='driver'>
								<MapProvider>
									<DriverProvider>
										<ToastProvider placement='top-center' />
										{children}
									</DriverProvider>
								</MapProvider>
							</PusherProvider>
						</NextThemesProvider>
					</HeroUIProvider>
				</QueryClientProvider>
			</TelemetryProvider>
		</ClerkProvider>
	);
}
