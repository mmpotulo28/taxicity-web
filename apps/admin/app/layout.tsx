import "@/styles/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
 title: "Admin Dashboard - TaxiCity",
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <html lang="en">
   <body>{children}</body>
  </html>
 );
}
