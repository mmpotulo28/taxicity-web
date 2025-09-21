"use client";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
	let currentPage: "map" | "settings" | "trip-history" = "map"; // This can be dynamic based on routing or state
	const onNavigate = (page: string) => {
		// Handle navigation logic here, e.g., using Next.js router
		console.log(`Navigating to ${page}`);
	};

	return (
		<div className="flex flex-col h-screen max-w-md mx-auto bg-background">
			{/* App Header */}
			<header className="flex items-center justify-between px-4 py-3 bg-primary shadow-sm">
				<div className="flex items-center gap-2">
					<Icon icon="lucide:taxi" className="text-white text-2xl" />
					<h1 className="text-xl font-semibold text-white">TaxiCity</h1>
				</div>
				<Button isIconOnly variant="light" aria-label="User profile" className="text-white">
					<Icon icon="lucide:user" className="text-xl" />
				</Button>
			</header>
			Main Content
			<motion.main
				className="flex-1 overflow-hidden"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3 }}>
				{children}
			</motion.main>
			{/* App Footer */}
			<footer className="flex justify-around items-center py-2 px-4 bg-white border-t border-default-200">
				<Button
					variant="light"
					className={`flex flex-col items-center ${currentPage === "map" ? "text-primary" : ""}`}
					onPress={() => onNavigate("map")}>
					<Icon icon="lucide:map" className="text-xl" />
					<span className="text-tiny mt-1">Map</span>
				</Button>
				<Button
					variant="light"
					className={`flex flex-col items-center `}
					onPress={() => onNavigate("trip-history")}>
					<Icon icon="lucide:clock" className="text-xl" />
					<span className="text-tiny mt-1">History</span>
				</Button>
				<Button
					variant="light"
					className={`flex flex-col items-center `}
					onPress={() => onNavigate("support")}>
					<Icon icon="lucide:message-square" className="text-xl" />
					<span className="text-tiny mt-1">Support</span>
				</Button>
				<Button
					variant="light"
					className={`flex flex-col items-center `}
					onPress={() => onNavigate("settings")}>
					<Icon icon="lucide:settings" className="text-xl" />
					<span className="text-tiny mt-1">Settings</span>
				</Button>
			</footer>
		</div>
	);
};

export { Wrapper };
