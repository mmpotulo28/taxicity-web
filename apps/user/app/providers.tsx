"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/toast";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { RideProvider } from "@taxicity/ui";
import { MapProvider } from "@taxicity/ui";
import { clerkConfig } from "@/lib/config/clerk";

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
			<QueryClientProvider client={queryClient}>
				<HeroUIProvider navigate={router.push}>
					<NextThemesProvider {...themeProps}>
						<MapProvider>
							<RideProvider>
								<ToastProvider placement="top-center" />
								{children}
							</RideProvider>
						</MapProvider>
					</NextThemesProvider>
				</HeroUIProvider>
			</QueryClientProvider>
		</ClerkProvider>
	);
}

export { Providers };
