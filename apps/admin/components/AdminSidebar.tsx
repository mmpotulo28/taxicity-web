"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";
import { addToast } from "@heroui/toast";

import { ThemeSwitch } from "./theme-switch";

interface NavItemProps {
	href: string;
	icon: string;
	label: string;
	currentPath: string;
	badge?: number;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, currentPath, badge }) => {
	const isActive = currentPath === href || currentPath.startsWith(`${href}/`);

	return (
		<Button
			as={Link}
			className={`justify-start w-full ${isActive ? "bg-primary text-white" : "bg-transparent hover:bg-default-100"}`}
			endContent={
				badge ? (
					<div className="ml-auto bg-danger text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
						{badge}
					</div>
				) : null
			}
			href={href}
			startContent={<Icon icon={icon} />}
			variant={isActive ? "solid" : "light"}>
			{label}
		</Button>
	);
};

const AdminSidebar: React.FC = () => {
	const pathname = usePathname() || "";
	const [collapsed, setCollapsed] = useState(false);

	const mainNavItems = [
		{ href: "/dashboard", icon: "lucide:layout-dashboard", label: "Dashboard" },
		{ href: "/dashboard/drivers", icon: "lucide:users", label: "Drivers", badge: 3 },
		{ href: "/dashboard/taxis", icon: "lucide:car", label: "Taxis" },
		{ href: "/dashboard/routes", icon: "lucide:route", label: "Routes" },
		{ href: "/dashboard/ranks", icon: "lucide:map-pin", label: "Ranks" },
		{ href: "/dashboard/trips", icon: "lucide:map", label: "Trips", badge: 12 },
	];

	const systemNavItems = [
		{ href: "/dashboard/users", icon: "lucide:user-cog", label: "Admin Users" },
		{ href: "/dashboard/reports", icon: "lucide:bar-chart-2", label: "Reports" },
		{ href: "/dashboard/settings", icon: "lucide:settings", label: "Settings" },
		{
			href: "/dashboard/support",
			icon: "lucide:help-circle",
			label: "Support",
			badge: 5,
		},
	];

	const handleSignOut = () => {
		addToast({
			title: "Signed Out",
			description: "You have been signed out successfully",
			color: "success",
		});
		// In a real app, this would handle the sign out process
		window.location.href = "/login";
	};

	return (
		<div
			className={`${collapsed ? "w-20" : "w-64"} h-screen bg-background border-r border-divider flex flex-col transition-all duration-300`}>
			{/* Logo */}
			<div
				className={`p-4 flex items-center justify-between ${collapsed ? "justify-center" : "gap-2"}`}>
				<Icon className="text-primary text-2xl flex-shrink-0" icon="lucide:taxi" />
				{!collapsed && <h1 className="font-bold text-xl">TaxiCity Admin</h1>}
				<ThemeSwitch />
				<Button
					isIconOnly
					className="self-end"
					size="sm"
					variant="light"
					onPress={() => setCollapsed(!collapsed)}>
					<Icon icon={collapsed ? "lucide:chevron-right" : "lucide:chevron-left"} />
				</Button>
			</div>

			<Divider />

			{/* Main Navigation */}
			<div className="p-2 space-y-1 flex-1 overflow-y-auto">
				{mainNavItems.map((item) => (
					<NavItem
						key={item.href}
						badge={item.badge}
						currentPath={pathname}
						href={item.href}
						icon={item.icon}
						label={collapsed ? "" : item.label}
					/>
				))}

				<Divider className="my-2" />

				{systemNavItems.map((item) => (
					<NavItem
						key={item.href}
						badge={item.badge}
						currentPath={pathname}
						href={item.href}
						icon={item.icon}
						label={collapsed ? "" : item.label}
					/>
				))}
			</div>

			{/* User Section */}
			<div className={`p-4 border-t border-divider ${collapsed ? "items-center" : ""}`}>
				<div className={`flex ${collapsed ? "flex-col" : "items-center"} gap-2 mb-2`}>
					<Avatar
						className="w-10 h-10"
						src="https://img.heroui.chat/image/avatar?w=60&h=60&u=admin"
					/>
					{!collapsed && (
						<div>
							<p className="text-sm font-medium">Admin User</p>
							<p className="text-xs text-default-500">admin@taxicity.co.za</p>
						</div>
					)}
				</div>

				<Button
					className={collapsed ? "p-2 min-w-0" : "w-full justify-start"}
					color="danger"
					size="sm"
					startContent={!collapsed && <Icon icon="lucide:log-out" />}
					variant="flat"
					onPress={handleSignOut}>
					{collapsed ? <Icon icon="lucide:log-out" /> : "Sign Out"}
				</Button>
			</div>
		</div>
	);
};

export default AdminSidebar;
