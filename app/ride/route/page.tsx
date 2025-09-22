"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody, Input, Tabs, Tab, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRide } from "@/context/RideContext";
import { useRouter } from "next/router";

// Sample data for routes and ranks
const routes = [
	{ id: "1", name: "CBD to Soweto", rank: "Central Rank" },
	{ id: "2", name: "Sandton to Alexandra", rank: "North Rank" },
	{ id: "3", name: "Pretoria to Johannesburg", rank: "East Rank" },
	{ id: "4", name: "Randburg to Midrand", rank: "West Rank" },
	{ id: "5", name: "Roodepoort to Krugersdorp", rank: "South Rank" },
];

export const RouteSelector: React.FC = () => {
	const router = useRouter();
	const { setSelectedRoute, setSelectedRank } = useRide();
	const [searchQuery, setSearchQuery] = React.useState("");

	const filteredRoutes = React.useMemo(() => {
		if (!searchQuery) return routes;

		return routes.filter(
			(route) =>
				route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				route.rank.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [searchQuery]);

	const onRouteSelect = (route: string, rank: string) => {
		setSelectedRoute(route);
		setSelectedRank(rank);
		// Navigate to location picker page
		router.push(
			"/location?from=" + encodeURIComponent(route) + "&rank=" + encodeURIComponent(rank),
		);
	};

	return (
		<motion.div
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-white shadow-sm">
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
				<div className="space-y-3">
					{filteredRoutes.map((route) => (
						<RouteCard
							key={route.id}
							route={route.name}
							rank={route.rank}
							onSelect={() => onRouteSelect(route.name, route.rank)}
						/>
					))}

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

interface RouteCardProps {
	route: string;
	rank: string;
	onSelect: () => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, rank, onSelect }) => {
	return (
		<Card className="shadow-sm" isPressable onPress={onSelect}>
			<CardBody className="p-4">
				<div className="flex justify-between items-start">
					<div>
						<div className="flex items-center gap-2">
							<Icon icon="lucide:route" className="text-primary" />
							<h3 className="font-medium">{route}</h3>
						</div>
						<div className="flex items-center gap-2 mt-2 text-default-500 text-sm">
							<Icon icon="lucide:map-pin" className="text-danger text-sm" />
							<span>{rank}</span>
						</div>
					</div>
					<div className="flex flex-col items-end">
						<div className="bg-success-100 text-success-600 text-xs px-2 py-0.5 rounded-full">
							Active
						</div>
						<div className="flex items-center mt-2 text-xs text-default-400">
							<Icon icon="lucide:taxi" className="mr-1" />
							<span>8 taxis available</span>
						</div>
					</div>
				</div>

				<Divider className="my-3" />

				<div className="flex justify-between items-center">
					<div className="text-xs text-default-500">
						<span className="font-medium">R15.00 - R25.00</span> estimated fare
					</div>
					<Button
						size="sm"
						color="primary"
						variant="light"
						endContent={<Icon icon="lucide:arrow-right" />}
						onPress={onSelect}>
						Select
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};
