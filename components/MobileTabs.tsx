"use client";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MobileTabs = () => {
	const pathname = usePathname();
	// CHECK CURRENT PAGE LOGIC FROM URL
	const [currentPage, setCurrentPage] = useState<"map" | "settings" | "trip-history" | "support">(
		"map",
	);

	useEffect(() => {
		const handleRouteChange = (url: string) => {
			if (url.includes("map")) setCurrentPage("map");
			else if (url.includes("settings")) setCurrentPage("settings");
			else if (url.includes("trip-history")) setCurrentPage("trip-history");
			else if (url.includes("support")) setCurrentPage("support");
		};

		// listen to route changes
		handleRouteChange(pathname || "");

		return () => {
			// Cleanup listener on unmount
		};
	}, [pathname]);

	return (
		<footer className="flex justify-around items-center py-2 px-4 bg-white border-t border-default-200">
			<Button
				as={Link}
				variant="light"
				className={`flex flex-col items-center ${currentPage === "map" ? "text-primary" : ""}`}
				href="/">
				<Icon icon="lucide:map" className="text-xl" />
				<span className="text-tiny mt-1">Map</span>
			</Button>
			<Button variant="light" className={`flex flex-col items-center `} href="/trip-history">
				<Icon icon="lucide:clock" className="text-xl" />
				<span className="text-tiny mt-1">History</span>
			</Button>
			<Button variant="light" className={`flex flex-col items-center `} href="/support">
				<Icon icon="lucide:message-square" className="text-xl" />
				<span className="text-tiny mt-1">Support</span>
			</Button>
			<Button variant="light" className={`flex flex-col items-center `} href="/settings">
				<Icon icon="lucide:settings" className="text-xl" />
				<span className="text-tiny mt-1">Settings</span>
			</Button>
		</footer>
	);
};

export default MobileTabs;
