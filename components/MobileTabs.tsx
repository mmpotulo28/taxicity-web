"use client";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Modern tab data structure
const tabs = [
  {
    key: "home",
    label: "Home",
    icon: "lucide:home",
    href: "/",
  },
  { key: "route", label: "Route", icon: "lucide:route", href: "/ride/route" },
  {
    key: "trip-history",
    label: "History",
    icon: "lucide:clock",
    href: "/ride/trip/history",
  },
  {
    key: "support",
    label: "Support",
    icon: "lucide:message-square",
    href: "/support",
  },
  {
    key: "settings",
    label: "Settings",
    icon: "lucide:settings",
    href: "/settings",
  },
];

const MobileTabs = () => {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState<
    "home" | "settings" | "trip-history" | "support" | "route"
  >("home");

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (url === "/") setCurrentPage("home");
      else if (url.includes("route")) setCurrentPage("route");
      else if (url.includes("settings")) setCurrentPage("settings");
      else if (url.includes("history")) setCurrentPage("trip-history");
      else if (url.includes("support")) setCurrentPage("support");
    };

    handleRouteChange(pathname || "");

    return () => {};
  }, [pathname]);

  return (
    <footer className="z-50 bg-gradient from-transparent via-primary to-transparent border-t border-default-200 shadow-lg h-16 rounded-t-2xl">
      <nav className="flex justify-around items-center">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.key;

          return (
            <Button
              key={tab.key}
              as={Link}
              className={`flex flex-col items-center w-full transition-all duration-200 px-3 py-2 h-16
								${isActive ? "bg-primary/10 text-primary font-semibold shadow-md" : "text-default-700"}
								hover:bg-primary/5 active:scale-95`}
              href={tab.href}
              radius="none"
              style={{
                position: "relative",
                minWidth: 64,
              }}
              variant="light"
            >
              <Icon
                className="text-2xl h-4 w-4 text-default-700"
                fontSize={24}
                icon={tab.icon}
              />

              <span
                className={`text-xs ${isActive ? "font-bold" : "font-normal"}`}
              >
                {tab.label}
              </span>

              {isActive && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-primary"
                  style={{ boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)" }}
                />
              )}
            </Button>
          );
        })}
      </nav>
    </footer>
  );
};

export default MobileTabs;
