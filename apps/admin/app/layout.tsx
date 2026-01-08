import "@taxicity/ui/styles/global.css";
import { Metadata } from "next";
import { Providers } from "./providers";
import { DashboardShell } from "@/components/layout/shell";

export const metadata: Metadata = {
 title: "Admin Dashboard - TaxiCity",
 description: "Admin dashboard for TaxiCity management",
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <html lang="en" suppressHydrationWarning>
   <body className="min-h-screen bg-background font-sans antialiased">
    <Providers>
     <DashboardShell>
      {children}
     </DashboardShell>
    </Providers>
   </body>
  </html>
 );
}
