import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
// Ensure Button is a named export
// Ensure Icon is a named export
// Ensure motion is a named export

import { Providers } from "./providers";
import { Main } from "./Main";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import MobileTabs from "@/components/MobileTabs";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers
          themeProps={{
            attribute: "class",
            defaultTheme: "dark",
            themes: ["light", "dark"],
          }}
        >
          <div className="flex flex-col h-screen max-w-md mx-auto text-foreground bg-background">
            {/* <Header /> */}
            <Main>{children}</Main>
            <MobileTabs />
          </div>
        </Providers>
      </body>
    </html>
  );
}
