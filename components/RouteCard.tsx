import { useRide } from "@/context/RideContext";
import { iRank, iRoute } from "@/types";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

interface RouteCardProps {
	route: iRoute;
	rank: iRank;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, rank }) => {
	const router = useRouter();
	const { setSelectedRoute, setSelectedRank } = useRide();

	const onRouteSelect = (route: iRoute, rank: iRank) => {
		setSelectedRoute(route);
		setSelectedRank(rank);
		// Navigate to location picker page
		router.push(
			"/ride/location?from=" +
				encodeURIComponent(route.name) +
				"&rank=" +
				encodeURIComponent(rank.name),
		);
	};

	return (
		<Card className="shadow-sm w-full">
			<CardBody className="p-4">
				<div className="flex justify-between items-start">
					<div>
						<div className="flex items-center gap-2">
							<Icon icon="lucide:route" className="text-primary" />
							<h3 className="font-medium">{route.name}</h3>
						</div>
						<div className="flex items-center gap-2 mt-2 text-default-500 text-sm">
							<Icon icon="lucide:map-pin" className="text-danger text-sm" />
							<span>{rank.name}</span>
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
						onPress={onRouteSelect.bind(null, route, rank)}>
						Select
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};

export default RouteCard;
