import "@/styles/globals.css";
import { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
 title: "Driver App - TaxiCity",
 description: "Driver portal for TaxiCity",
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <html lang="en" suppressHydrationWarning>
   <body className="min-h-screen bg-background font-sans antialiased">
    <Providers>{children}</Providers>
   </body>
  </html>
 );
}
