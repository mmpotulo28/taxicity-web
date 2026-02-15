"use client";

import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@taxiciti/utils";

// Reusing the tabs definition logic but for sidebar
// We can modify this later to use a config approach

const USER_TABS = [
  { key: "home", label: "Home", icon: "lucide:home", href: "/" },
  { key: "history", label: "History", icon: "lucide:clock", href: "/ride/trip/history" },
  { key: "ride", label: "Ride", icon: "lucide:bus", href: "/ride/route" },
  { key: "support", label: "Support", icon: "lucide:message-square", href: "/support" },
  { key: "settings", label: "Settings", icon: "lucide:settings", href: "/settings" },
];

const DRIVER_TABS = [
  { key: "dashboard", label: "Console", icon: "lucide:car-taxi-front", href: "/" },
  { key: "earnings", label: "Earnings", icon: "lucide:wallet", href: "/earnings" },
  { key: "requests", label: "Requests", icon: "lucide:bell", href: "/requests" },
  { key: "vehicle", label: "Vehicle", icon: "lucide:car", href: "/vehicle" },
  { key: "profile", label: "Profile", icon: "lucide:user", href: "/profile" },
];

export const Sidebar = ({ type }: { type: "user" | "driver" }) => {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = type === "user" ? USER_TABS : DRIVER_TABS;

  return (
    <div className="flex h-full flex-col justify-between bg-content1 px-4 py-6">
      <div className="flex flex-col gap-6">
        {/* Logo or Brand */}
        <div className="flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-full bg-primary" />
          <span className="text-xl font-bold">TaxiCity</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || (pathname?.startsWith(tab.href) && tab.href !== "/");

            return (
              <Button
                key={tab.key}
                variant="light"
                size="lg"
                className={cn(
                  "justify-start gap-3 px-3 py-3 h-auto",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground-500 hover:bg-default-100"
                )}
                onPress={() => router.push(tab.href)}
              >
                <Icon icon={tab.icon} className="h-5 w-5" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>

      {/* User Button / Footer */}
      <div className="mt-auto px-2">
        <div className="flex bg-default-50 p-3 rounded-lg items-center gap-3">
          <UserButton />
          <div className="flex flex-col text-sm">
            <span className="font-medium">Account</span>
            <span className="text-tiny text-default-500">Manage your profile</span>
          </div>
        </div>
      </div>
    </div>
  );
};
