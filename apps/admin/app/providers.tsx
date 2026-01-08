"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { ToastProvider } from "@heroui/toast";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkConfig } from "@/lib/config/clerk";

export function Providers({ children }: { children: React.ReactNode }) {
 const router = useRouter();

 return (
  <ClerkProvider {...clerkConfig}>
   <HeroUIProvider navigate={router.push}>
    <NextThemesProvider attribute="class" defaultTheme="dark">
     <ToastProvider />
     {children}
    </NextThemesProvider>
   </HeroUIProvider>
  </ClerkProvider>
 );
}
