import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Icon } from "@iconify/react";

import { iTaxi } from "@/types";

const DriverCard: React.FC<{ taxi: iTaxi; handleCancelRide: () => void; currentCapacity?: number }> = ({
	taxi,
	handleCancelRide,
	currentCapacity,
}) => {
	return (
		<Card className="mb-4">
			<CardBody className="p-4">
				<h3 className="text-sm font-semibold mb-2">Driver Information</h3>
				<div className="flex items-center gap-3 mb-2">
					<div className="w-12 h-12 bg-default-100 rounded-full flex items-center justify-center">
						<Icon className="text-2xl text-default-400" icon="lucide:user" />
					</div>
					<div>
						<p className="font-medium">{taxi.driver}</p>
						<p className="text-xs text-default-500">{taxi.model}</p>
						<div className="flex items-center text-xs mt-1">
							<Icon className="text-yellow-500" icon="lucide:star" />
							<span className="ml-1">{taxi.rating.toFixed(1)}</span>
						</div>
					</div>
				</div>

				{currentCapacity !== undefined && (
					<div className="flex items-center gap-2 mb-3 text-sm bg-default-50 p-2 rounded-lg">
						<Icon className="text-primary" icon="lucide:users" />
						<span>
							Current Capacity: <span className="font-semibold">{currentCapacity}</span> / {taxi.capacity}
						</span>
					</div>
				)}

				<Divider className="my-3" />

				<div className="flex justify-between items-center">
					<Button
						className="flex-1"
						color="primary"
						startContent={<Icon icon="lucide:phone" />}
						variant="flat">
						Call Driver
					</Button>
					<Button
						className="flex-1 ml-2"
						color="danger"
						startContent={<Icon icon="lucide:x" />}
						variant="flat"
						onPress={handleCancelRide}>
						Cancel Ride
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};

export default DriverCard;
