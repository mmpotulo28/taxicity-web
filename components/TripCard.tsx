import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Icon } from "@iconify/react";

import { iTrip } from "@/types";

interface TripCardProps {
	trip: iTrip;
	onSelect: () => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onSelect }) => {
	return (
		<Card className="shadow-sm w-full">
			<CardBody className="p-4">
				<div className="flex justify-between items-start">
					<div>
						<div className="flex items-center gap-2">
							<Icon className="text-primary" icon="lucide:route" />
							<h3 className="font-medium">{trip.route}</h3>
						</div>
						<div className="flex items-center gap-2 mt-1 text-default-500 text-xs">
							<Icon className="text-default-400" icon="lucide:calendar" />
							<span>
								{trip.date} • {trip.time}
							</span>
						</div>
					</div>
					<div className="text-right">
						<div className="font-medium">{trip.fare}</div>
						<div className="text-xs text-default-500 mt-1">{trip.paymentMethod}</div>
					</div>
				</div>

				<div className="mt-3">
					<div className="flex items-start gap-3">
						<div className="flex flex-col items-center">
							<div className="w-2 h-2 rounded-full bg-primary" />
							<div className="w-0.5 h-6 bg-default-200" />
							<div className="w-2 h-2 rounded-full bg-danger" />
						</div>

						<div className="flex-1">
							<div className="text-xs text-default-500">{trip.pickup}</div>
							<div className="text-xs text-default-500 mt-3">{trip.dropoff}</div>
						</div>
					</div>
				</div>

				<Divider className="my-3 mt-8" />

				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2 text-xs text-default-500">
						<Icon className="text-default-400" icon="lucide:user" />
						<span>{trip.driver}</span>
					</div>
					<Button
						color="primary"
						endContent={<Icon icon="lucide:chevron-right" />}
						size="sm"
						variant="light"
						onPress={onSelect}>
						Details
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};

export default TripCard;
