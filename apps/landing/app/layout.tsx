import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@taxiciti/ui/styles/global.css";
import { Providers } from "./providers";
import { cn } from "@heroui/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
	title: "TaxiCiTi - South Africa's Premier Shared Taxi Platform",
	description: "Connectng commuters and drivers for safe, reliable, and affordable shared rides.",
	metadataBase: new URL("https://www.taxyciti.net"),
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body className={cn(inter.className, "scroll-smooth")}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
