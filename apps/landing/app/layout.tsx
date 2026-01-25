import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@taxyciti/ui/styles/global.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
 title: "TaxiCiTi - South Africa's Premier Shared Taxi Platform",
 description: "Connectng commuters and drivers for safe, reliable, and affordable shared rides.",
 metadataBase: new URL('https://www.taxyciti.net'),
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <html lang="en">
   <body className={inter.className}>{children}</body>
  </html>
 );
}
