"use client";

import { usePathname } from "next/navigation";
import { cn } from "@taxiciti/utils";
import Header from "../Header";
import MobileTabs from "../MobileTabs";
import DriverTabs from "../DriverTabs";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
 children: React.ReactNode;
 type: "user" | "driver";
 showHeader?: boolean;
 headerEndContent?: React.ReactNode;
 showMobileHeader?: boolean;
}

export const MainLayout = ({
 children,
 type,
 showHeader = true,
 headerEndContent,
 showMobileHeader = false
}: MainLayoutProps) => {
 const pathname = usePathname();


 return (
  <div className="flex h-screen w-full bg-background overflow-hidden">
   {/* Desktop Sidebar - Hidden on Mobile */}
   <div className="sm:hidden md:flex h-full w-64 flex-col border-r border-default-200 shrink-0">
    <Sidebar type={type} />
   </div>

   {/* Main Content Area */}
   <div className="flex flex-1 flex-col relative h-full w-full overflow-hidden">
    {/* Header - Adaptive width */}
    {showHeader && (
     <div className={cn(
      "w-full shrink-0 border-b border-default-100",
      showMobileHeader ? "block" : "sm:hidden md:block"
     )}>
      <Header
       className="static bg-transparent border-none shadow-none"
       endContent={headerEndContent}
      />
     </div>
    )}

    {/* Scrollable Content */}
    <main className="flex-1 overflow-y-auto overflow-x-hidden relative w-full h-full">
     {children}
    </main>

    {/* Mobile Tabs - Visible only on Mobile */}
    <div className="md:hidden">
     {type === "user" ? <MobileTabs /> : <DriverTabs />}
    </div>
   </div>
  </div>
 );
};
