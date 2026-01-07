import type { Metadata } from "next";
import { Providers } from "./providers";
import "../styles/globals.css";

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
  <html lang="en">
   <body>
    <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
     <div className="h-full w-full flex flex-col max-w-lg mx-auto">
      {children}
     </div>
    </Providers>
   </body>
  </html>
 );
}
