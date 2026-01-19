import "@taxicity/ui/styles/global.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";
import { Main } from "./Main";

import { fontSans } from "@/lib/config/fonts";
import { siteConfig } from "@/lib/config/site";
import { MobileTabs, GlobalModals } from "@taxicity/ui";

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
			<head>
				{/* Manually load fonts to bypass build-time fetch errors in Docker */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
				<style>{`
                  :root {
                    --font-sans: 'Inter', sans-serif;
                    --font-mono: 'Fira Code', monospace;
                  }
                `}</style>
			</head>
			<body
				className={clsx(
					"max-h-screen text-foreground bg-background font-sans antialiased max-w-lg",
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
					<div className="flex flex-col h-screen mx-auto text-foreground bg-background">
						<Main>{children}</Main>
						<MobileTabs />
						<GlobalModals />
					</div>
				</Providers>
			</body>
		</html>
	);
}
