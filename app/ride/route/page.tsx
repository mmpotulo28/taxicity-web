"use client";
import React from "react";
import { motion } from "framer-motion";
import { Input, Tabs, Tab, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { ranks, routes } from "@/lib/data";
import RouteCard from "@/components/RouteCard";

// Helper to extract fare min for sorting
const getFareMin = (fare?: string) => {
	if (!fare) return 0;
	const match = fare.match(/R(\d+(\.\d+)?)/);
	return match ? parseFloat(match[1]) : 0;
};

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const RouteSelector: React.FC = () => {
	const [searchQuery, setSearchQuery] = React.useState("");
	const [selectedLetter, setSelectedLetter] = React.useState<string | null>(null);
	const [sortBy, setSortBy] = React.useState<"name" | "fare" | "status">("name");

	const filteredRoutes = React.useMemo(() => {
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
	}, [searchQuery, selectedLetter, sortBy]);

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

				{/* Alphabet Filter */}
				<div className="flex flex-wrap gap-1 mb-3">
					{alphabet.map((letter) => (
						<button
							key={letter}
							className={`w-7 h-7 rounded text-xs font-bold transition ${
								selectedLetter === letter
									? "bg-primary text-white"
									: "bg-default-100 text-default-500 hover:bg-primary/10"
							}`}
							onClick={() =>
								setSelectedLetter(selectedLetter === letter ? null : letter)
							}
							type="button">
							{letter}
						</button>
					))}
				</div>

				<div className="flex items-center justify-between">
					{/* Sorting */}
					<div className="flex items-center gap-2 ">
						<span className="text-xs text-default-500">Sort by:</span>
						<Select
							size="sm"
							selectedKeys={[sortBy]}
							onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as any)}
							className="w-32">
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
