import React from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { useRide } from "@/context/RideContext";
import { iRoute, iRank } from "@/types";

interface RouteCardProps {
	route: iRoute;
	rank: iRank;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, rank }) => {
	const router = useRouter();
	const { setSelectedRoute } = useRide();

	const handleSelectRoute = () => {
		setSelectedRoute(route);
		router.push("/ride/location");
	};

	const getStatusColor = () => {
		switch (route.status) {
			case "active":
				return "success";
			case "busy":
				return "warning";
			case "delayed":
				return "danger";
			default:
				return "default";
		}
	};

	return (
		<Card className="shadow-sm w-full">
			<CardBody className="p-4">
				<div className="flex justify-between items-start">
					<div>
						<h3 className="font-medium">{route.name}</h3>
						<div className="flex items-center gap-2 mt-1 text-default-500 text-xs">
							<Icon className="text-default-400" icon="lucide:map-pin" />
							<span>From: {rank.name}</span>
						</div>
					</div>
					<Chip color={getStatusColor()} size="sm" variant="flat">
						{route.status}
					</Chip>
				</div>

				{route.description && (
					<p className="text-xs text-default-500 mt-2">{route.description}</p>
				)}

				<div className="flex flex-wrap gap-4 mt-4 text-xs">
					<div className="flex items-center gap-1 text-default-500">
						<Icon icon="lucide:banknote" />
						<span>{route.estimatedFare}</span>
					</div>
					<div className="flex items-center gap-1 text-default-500">
						<Icon icon="lucide:clock" />
						<span>{route.estimatedDuration}</span>
					</div>
					<div className="flex items-center gap-1 text-default-500">
						<Icon icon="lucide:map" />
						<span>{route.distance}</span>
					</div>
				</div>

				<div className="flex justify-between items-center mt-4">
					<div className="text-xs text-default-500">{rank.operatingHours}</div>
					<Button
						color="primary"
						endContent={<Icon icon="lucide:arrow-right" />}
						onPress={handleSelectRoute}>
						Select Route
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};

export default RouteCard;
