import { DriverProvider } from "@/context/DriverContext";

export default function DriverLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <DriverProvider>
   <div className="h-full w-full flex flex-col">
    {children}
   </div>
  </DriverProvider>
 );
}
