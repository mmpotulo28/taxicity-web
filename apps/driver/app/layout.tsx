import { DriverProvider } from "@/context/DriverContext";

export default function DriverLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <DriverProvider>
   <div className="h-full w-full flex flex-col max-w-lg mx-auto">
    {children}
   </div>
  </DriverProvider>
 );
}
