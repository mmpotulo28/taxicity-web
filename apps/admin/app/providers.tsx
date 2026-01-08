"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkConfig } from "@taxicity/configs/clerk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export interface ProvidersProps {
 children: React.ReactNode;
 themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
 interface RouterConfig {
  routerOptions: NonNullable<
   Parameters<ReturnType<typeof useRouter>["push"]>[1]
  >;
 }
}

const queryClient = new QueryClient();

export function Providers({ children, themeProps }: ProvidersProps) {
 const router = useRouter();

 return (
  <ClerkProvider appearance={clerkConfig.appearance}>
   <QueryClientProvider client={queryClient}>
    <HeroUIProvider navigate={router.push}>
     <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </HeroUIProvider>
   </QueryClientProvider>
  </ClerkProvider>
 );
}
