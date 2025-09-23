"use client";
import React from "react";
import { motion } from "framer-motion";
import { Input, Tabs, Tab } from "@heroui/react";
import { Icon } from "@iconify/react";
import { ranks, routes } from "@/lib/data";
import RouteCard from "@/components/RouteCard";

const RouteSelector: React.FC = () => {
	const [searchQuery, setSearchQuery] = React.useState("");

	const filteredRoutes = React.useMemo(() => {
		if (!searchQuery) return routes;

		return routes.filter(
			(route) =>
				route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				route.rankId.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [searchQuery]);

	return (
		<motion.div
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-background shadow-sm">
				<h2 className="text-lg font-semibold mb-4">Select Your Route</h2>
				<Input
					placeholder="Search routes or ranks"
					value={searchQuery}
					onValueChange={setSearchQuery}
					startContent={<Icon icon="lucide:search" className="text-default-400" />}
					className="mb-2"
				/>

				<Tabs aria-label="Route options" color="primary" variant="underlined">
					<Tab key="routes" title="Routes" />
					<Tab key="ranks" title="Ranks" />
				</Tabs>
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
				<div className="space-y-6">
					{filteredRoutes.map((route) => {
						const rank = ranks.find((r) => r.id === route.rankId);
						if (!rank) return null; // Skip if no matching rank found
						return <RouteCard key={route.id} route={route} rank={rank} />;
					})}

					{filteredRoutes.length === 0 && (
						<div className="text-center py-8">
							<Icon
								icon="lucide:search-x"
								className="text-4xl text-default-300 mx-auto mb-2"
							/>
							<p className="text-default-500">
								No routes found matching "{searchQuery}"
							</p>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
};

export default RouteSelector;
