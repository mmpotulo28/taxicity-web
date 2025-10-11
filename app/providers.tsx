"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/toast";

import { RideProvider } from "@/context/RideContext";
import { MapProvider } from "@/context/MapContext";
import { ClerkProvider } from "@clerk/nextjs/dist/types/components.server";

export interface ProvidersProps {
	children: React.ReactNode;
	themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
	interface RouterConfig {
		routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
	}
}

function Providers({ children, themeProps }: ProvidersProps) {
	const router = useRouter();

	return (
		<ClerkProvider>
			<HeroUIProvider navigate={router.push}>
				<NextThemesProvider {...themeProps}>
					<RideProvider>
						<MapProvider>
							<ToastProvider />
							{children}
						</MapProvider>
					</RideProvider>
				</NextThemesProvider>
			</HeroUIProvider>
		</ClerkProvider>
	);
}

export { Providers };
