"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Car, Map, Settings, FileText, Bell, ShieldCheck, Bus, Waypoints, LifeBuoy } from "lucide-react";
import { cn, Card, CardBody, Avatar } from "@heroui/react";

const sidebarItems = [
 {
  title: "Overview",
  href: "/",
  icon: LayoutDashboard,
 },
 {
  title: "Drivers",
  href: "/drivers",
  icon: Car,
 },
 {
  title: "Fleet",
  href: "/vehicles",
  icon: Bus,
 },
 {
  title: "Routes",
  href: "/routes",
  icon: Waypoints,
 },
 {
  title: "Passengers",
  href: "/users",
  icon: Users,
 },
 {
  title: "Live Map",
  href: "/trips",
  icon: Map,
 },
 {
  title: "Reports",
  href: "/reports",
  icon: FileText,
 },
 {
  title: "Support",
  href: "/support",
  icon: LifeBuoy,
 },
 {
  title: "Notifications",
  href: "/notifications",
  icon: Bell,
 },
 {
  title: "Settings",
  href: "/settings",
  icon: Settings,
 },
];

interface SidebarProps {
 className?: string;
}

export function Sidebar({ className }: SidebarProps) {
 const pathname = usePathname();

 return (
  <aside
   className={cn(
    "fixed left-0 top-0 z-40 h-screen w-72 -translate-x-full border-r border-default-100 bg-background/95 backdrop-blur-xl transition-transform md:translate-x-0 hidden md:block",
    className
   )}
  >
   <div className="flex flex-col h-full">
    {/* Brand Header */}
    <div className="flex h-20 items-center px-6 border-b border-default-100">
     <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/25">
       <ShieldCheck className="h-6 w-6 text-white" />
      </div>
      <div>
       <h1 className="text-lg font-bold tracking-tight">TaxiCity</h1>
       <p className="text-xs font-medium text-default-500">Admin Portal</p>
      </div>
     </div>
    </div>

    {/* Navigation */}
    <div className="flex-1 overflow-y-auto px-4 py-6">
     <div className="space-y-4">
      <div className="px-2">
       <p className="text-xs font-semibold uppercase tracking-wider text-default-400">Main Menu</p>
      </div>
      <nav className="space-y-1">
       {sidebarItems.map((item) => {
        const isActive = pathname === item.href;
        return (
         <Link
          key={item.href}
          href={item.href}
          className={cn(
           "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
           isActive
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
            : "text-default-600 hover:bg-default-100 hover:text-foreground"
          )}
         >
          <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-default-500 group-hover:text-foreground")} />
          {item.title}
         </Link>
        );
       })}
      </nav>
     </div>
    </div>

    {/* User Footer */}
    <div className="border-t border-default-100 p-4">
     <Card className="border-none bg-default-50 shadow-sm" shadow="none">
      <CardBody className="p-3">
       <div className="flex items-center gap-3">
        <Avatar isBordered color="primary" size="sm" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
        <div className="flex flex-col">
         <p className="text-sm font-semibold">Admin User</p>
         <p className="text-xs text-default-500">Super Admin</p>
        </div>
       </div>
      </CardBody>
     </Card>
    </div>
   </div>
  </aside>
 );
}
