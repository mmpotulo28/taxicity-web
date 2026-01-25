"use client";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Input, Tabs, Tab, Select, SelectItem, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";

import { useRide, RouteCard } from "@taxyciti/ui";


// Helper to extract fare min for sorting
const getFareMin = (fare?: string) => {
	if (!fare) return 0;
	const match = fare.match(/R(\d+(\.\d+)?)/);

	return match ? parseFloat(match[1]) : 0;
};

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const RouteSelector: React.FC = () => {
	const { routes, ranks, isLoading } = useRide();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
	const [sortBy, setSortBy] = useState<"name" | "fare" | "status">("name");

	const filteredRoutes = useMemo(() => {
		let filtered = routes;

		if (searchQuery) {
			filtered = filtered.filter(
				(route) =>
					route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					route.rankId.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		if (selectedLetter) {
			filtered = filtered.filter((route) =>
				route.name.toUpperCase().startsWith(selectedLetter),
			);
		}

		// Sorting
		if (sortBy === "name") {
			filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
		} else if (sortBy === "fare") {
			filtered = [...filtered].sort(
				(a, b) => getFareMin(a.estimatedFare) - getFareMin(b.estimatedFare),
			);
		} else if (sortBy === "status") {
			filtered = [...filtered].sort((a, b) => a.status.localeCompare(b.status));
		}

		return filtered;
	}, [routes, searchQuery, selectedLetter, sortBy]);

	return (
		<motion.div
			animate={{ opacity: 1 }}
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-background shadow-sm">
				<h2 className="text-lg font-semibold mb-4">Select Your Route</h2>
				<Input
					className="mb-2"
					placeholder="Search routes or ranks"
					startContent={<Icon className="text-default-400" icon="lucide:search" />}
					value={searchQuery}
					onValueChange={setSearchQuery}
				/>

				{/* Alphabet Filter */}
				<div className="flex flex-wrap gap-1 mb-3">
					{alphabet.map((letter) => (
						<button
							key={letter}
							className={`w-7 h-7 rounded text-xs font-bold transition ${selectedLetter === letter
								? "bg-primary text-white"
								: "bg-default-100 text-default-500 hover:bg-primary/10"
								}`}
							type="button"
							onClick={() =>
								setSelectedLetter(selectedLetter === letter ? null : letter)
							}>
							{letter}
						</button>
					))}
				</div>

				<div className="flex items-center justify-between">
					{/* Sorting */}
					<div className="flex items-center gap-2 ">
						<span className="text-xs text-default-500">Sort by:</span>
						<Select
							className="w-32"
							selectedKeys={[sortBy]}
							size="sm"
							onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as any)}>
							<SelectItem key="name">Name</SelectItem>
							<SelectItem key="fare">Fare</SelectItem>
							<SelectItem key="status">Status</SelectItem>
						</Select>
					</div>

					<Tabs aria-label="Route options" color="primary" variant="underlined">
						<Tab key="routes" title="Routes" />
						<Tab key="ranks" title="Ranks" />
					</Tabs>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
				{isLoading ? (
					<div className="flex justify-center items-center h-full">
						<Spinner size="lg" />
					</div>
				) : (
					<div className="space-y-6">
						{filteredRoutes.map((route) => {
							const rank = ranks.find((r) => r.id === route.rankId);

							if (!rank) return null; // Skip if no matching rank found

							return <RouteCard key={route.id} rank={rank} route={route} />;
						})}

						{filteredRoutes.length === 0 && (
							<div className="text-center py-8">
								<Icon
									className="text-4xl text-default-300 mx-auto mb-2"
									icon="lucide:search-x"
								/>
								<p className="text-default-500">
									No routes found matching &quot;{searchQuery}&quot;
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default RouteSelector;
