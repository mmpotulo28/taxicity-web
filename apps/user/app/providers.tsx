"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/toast";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { clerkConfig } from "@taxyciti/configs/clerk";
import { TelemetryProvider, PusherProvider, MapProvider, RideProvider } from "@taxyciti/ui";

export interface ProvidersProps {
	children: React.ReactNode;
	themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
	interface RouterConfig {
		routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
	}
}

const queryClient = new QueryClient();

function Providers({ children, themeProps }: ProvidersProps) {
	const router = useRouter();

	return (
		<ClerkProvider appearance={clerkConfig.appearance}>
			<TelemetryProvider appName="TaxyCiTi User" version="1.0.0">
				<QueryClientProvider client={queryClient}>
					<HeroUIProvider navigate={router.push}>
						<NextThemesProvider {...themeProps}>
							<PusherProvider>
								<MapProvider>
									<RideProvider>
										<ToastProvider placement="top-center" />
										{children}
									</RideProvider>
								</MapProvider>
							</PusherProvider>
						</NextThemesProvider>
					</HeroUIProvider>
				</QueryClientProvider>
			</TelemetryProvider>
		</ClerkProvider>
	);
}

export { Providers };
