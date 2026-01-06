import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";
import { Main } from "./Main";

import { fontSans } from "@/lib/config/fonts";
import { siteConfig } from "@/lib/config/site";
import MobileTabs from "@/components/MobileTabs";
import DriverTabs from "@/components/DriverTabs";
import Header from "@/components/Header";
import GlobalModals from "@/components/GlobalModals";

export const metadata: Metadata = {
	title: {
		default: siteConfig.name,
		template: `%s - ${siteConfig.name}`,
	},
	description: siteConfig.description,
	keywords: ["taxi", "south africa", "transportation", "booking", "ride sharing"],
	authors: [{ name: "TaxiCity Team" }],
	creator: "TaxiCity",
	openGraph: {
		type: "website",
		locale: "en_ZA",
		url: "https://taxicity.co.za",
		title: siteConfig.name,
		description: siteConfig.description,
		siteName: siteConfig.name,
	},
	twitter: {
		card: "summary_large_image",
		title: siteConfig.name,
		description: siteConfig.description,
		creator: "@taxicity_za",
	},
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
					"min-h-screen text-foreground bg-background font-sans antialiased max-w-lg",
					fontSans.variable,
				)}>
				<Providers
					themeProps={{
						attribute: "class",
						defaultTheme: "light",
						enableColorScheme: true,
						enableSystem: true,
						storageKey: "taxicity_theme",
						themes: ["light", "dark"],
					}}>
					<div className="flex flex-col h-screen  mx-auto text-foreground bg-background">
						<Main>{children}</Main>
						<MobileTabs />
						<DriverTabs />
						<GlobalModals />
					</div>
				</Providers>
			</body>
		</html>
	);
}
