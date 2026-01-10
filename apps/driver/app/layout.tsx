import type { Metadata } from "next";
import { Providers } from "./providers";
import "@taxicity/ui/styles/global.css";
import { NotificationBell } from "@/components/NotificationBell";
import { DriverTabs, Header } from "@taxicity/ui";

export const metadata: Metadata = {
 title: "TaxiCity Driver",
 description: "Driver application for TaxiCity",
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <html lang="en" suppressHydrationWarning>
   <body>
    <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
     <div className="h-full w-full flex flex-col max-w-lg mx-auto relative">
      <Header endContent={<NotificationBell />} driverMode />
      {children}
      <DriverTabs />
     </div>
    </Providers>
   </body>
  </html>
 );
}
