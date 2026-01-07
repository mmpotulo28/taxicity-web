"use client";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/toast";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MapProvider } from "@taxicity/ui";
import { DriverProvider } from "../context/DriverContext";
import { type ThemeProviderProps } from "next-themes"; // Correct import for types

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

export function Providers({ children, themeProps }: ProvidersProps) {
 const router = useRouter();

 return (
  <ClerkProvider>
   <QueryClientProvider client={queryClient}>
    <HeroUIProvider navigate={router.push}>
     <NextThemesProvider {...themeProps}>
      <MapProvider>
       <DriverProvider>
        <ToastProvider placement="top-center" />
        {children}
       </DriverProvider>
      </MapProvider>
     </NextThemesProvider>
    </HeroUIProvider>
   </QueryClientProvider>
  </ClerkProvider>
 );
}
