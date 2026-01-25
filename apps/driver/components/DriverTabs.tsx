"use client";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { cn } from "@taxyciti/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Driver tab data structure
const tabs = [
 {
  key: "home",
  label: "Console",
  icon: "lucide:car-taxi-front",
  href: "/",
 },
 {
  key: "earnings",
  label: "Earnings",
  icon: "lucide:wallet",
  href: "/earnings",
 },
 {
  key: "requests",
  label: "Requests",
  icon: "lucide:bell",
  href: "/requests",
  main: true
 },
 {
  key: "vehicle",
  label: "Vehicle",
  icon: "lucide:car",
  href: "/vehicle",
 },
 {
  key: "profile",
  label: "Profile",
  icon: "lucide:user",
  href: "/profile",
 },
];

const DriverTabs = () => {
 const pathname = usePathname();
 const [currentPage, setCurrentPage] = useState<string>("dashboard");

 useEffect(() => {
  const handleRouteChange = (url: string) => {
   if (url === "/") setCurrentPage("home");
   else if (url.includes("dashboard")) setCurrentPage("stats");
   else if (url.includes("earnings")) setCurrentPage("earnings");
   else if (url.includes("requests")) setCurrentPage("requests");
   else if (url.includes("vehicle")) setCurrentPage("vehicle");
   else if (url.includes("profile")) setCurrentPage("profile");
  };

  handleRouteChange(pathname || "");
 }, [pathname]);

 // Don't show on the application page
 if (pathname === "/apply" || pathname === "/status") return null;

 return (
  <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-default-200 shadow-lg h-16 rounded-t-2xl pb-safe">
   <nav className="flex justify-around items-center h-full">
    {tabs.map((tab) => {
     const isActive = currentPage === tab.key;

     return (
      <Button
       key={tab.key}
       as={Link}
       className={cn(
        "flex flex-col items-center w-full transition-all duration-200 px-3 py-2 h-16 bg-transparent",
        isActive ? "text-primary font-semibold" : "text-default-500",
        tab.main ? "-mt-8 shadow-xl rounded-full bg-primary text-white w-14 h-14 border-4 border-background" : "rounded-none"
       )}
       href={tab.href}
       radius="none"
       variant="light">
       <Icon
        className={cn(
         "text-2xl mb-1",
         tab.main ? "text-white w-6 h-6" : "text-current w-5 h-5"
        )}
        icon={tab.icon}
       />

       {!tab.main && (
        <span className="text-[10px] leading-none">
         {tab.label}
        </span>
       )}
      </Button>
     );
    })}
   </nav>
  </footer>
 );
};

export default DriverTabs;
