import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Button } from "@heroui/button"; // Ensure Button is a named export
import { Icon } from "@iconify/react"; // Ensure Icon is a named export
import { motion } from "framer-motion"; // Ensure motion is a named export
import { Wrapper } from "./wrapper";

export const metadata: Metadata = {
	title: {
		default: siteConfig.name,
		template: `%s - ${siteConfig.name}`,
	},
	description: siteConfig.description,
	icons: {
		icon: "/favicon.ico",
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html suppressHydrationWarning lang="en">
			<head />
			<body
				className={clsx(
					"min-h-screen text-foreground bg-background font-sans antialiased",
					fontSans.variable,
				)}>
				<Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
					<Wrapper>{children}</Wrapper>
				</Providers>
			</body>
		</html>
	);
}
