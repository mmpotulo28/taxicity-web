"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@heroui/react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
 const [sidebarOpen, setSidebarOpen] = useState(false);

 return (
  <div className="relative flex min-h-screen flex-col">
   <Sidebar
    className={cn(
     "transition-transform duration-300 md:translate-x-0",
     sidebarOpen ? "translate-x-0 block" : "-translate-x-full hidden md:block" // Force block when open on mobile
    )}
   />

   {/* Overlay for mobile */}
   {sidebarOpen && (
    <div
     className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
     onClick={() => setSidebarOpen(false)}
    />
   )}

   <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

   <main className="flex-1 px-4 py-8 md:ml-72 md:px-8">
    {children}
   </main>
  </div>
 );
}
