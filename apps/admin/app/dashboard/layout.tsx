"use client";
import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";

import AdminSidebar from "@/components/AdminSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<div className="flex h-screen bg-default-50">
			{/* Desktop Sidebar */}
			<div className="hidden md:block">
				<AdminSidebar />
			</div>

			{/* Mobile Sidebar */}
			{isMobileMenuOpen && (
				<div className="fixed inset-0 z-50 md:hidden">
					<div
						aria-label="Close menu overlay"
						className="absolute inset-0 bg-black/50"
						role="button"
						tabIndex={0}
						onClick={() => setIsMobileMenuOpen(false)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								setIsMobileMenuOpen(false);
							}
						}}
					/>
					<div className="absolute left-0 top-0 bottom-0 w-64 bg-background">
						<AdminSidebar />
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Mobile Header */}
				<div className="md:hidden p-4 border-b flex items-center">
					<Button isIconOnly variant="light" onPress={() => setIsMobileMenuOpen(true)}>
						<Icon icon="lucide:menu" />
					</Button>
					<div className="flex items-center gap-2 ml-4">
						<Icon className="text-primary text-2xl" icon="lucide:taxi" />
						<h1 className="font-bold text-lg">TaxiCity Admin</h1>
					</div>
				</div>

				<main className="flex-1 overflow-auto p-6">{children}</main>

				{/* Footer */}
				<footer className="border-t border-divider p-4 text-center text-sm text-default-500">
					<p>© 2023 TaxiCity. All rights reserved.</p>
				</footer>
			</div>
		</div>
	);
}
