import React from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody, Divider, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";

interface TaxiListProps {
	pickupLocation: string;
	dropoffLocation: string;
	onTaxiSelect: (taxiId: string) => void;
}

// Sample taxi data
const taxis = [
	{
		id: "1",
		driverName: "Sipho Mabena",
		vehicleInfo: "Toyota Quantum - White",
		licensePlate: "GP 123-456",
		rating: 4.8,
		distance: "2 min away",
		eta: "5 min",
	},
	{
		id: "2",
		driverName: "Thabo Ndlovu",
		vehicleInfo: "Toyota HiAce - Silver",
		licensePlate: "GP 789-012",
		rating: 4.5,
		distance: "5 min away",
		eta: "8 min",
	},
	{
		id: "3",
		driverName: "Mandla Khumalo",
		vehicleInfo: "Nissan Impendulo - White",
		licensePlate: "GP 345-678",
		rating: 4.7,
		distance: "7 min away",
		eta: "10 min",
	},
];

export const TaxiList: React.FC<TaxiListProps> = ({
	pickupLocation,
	dropoffLocation,
	onTaxiSelect,
}) => {
	const [loading, setLoading] = React.useState(true);
	const [availableTaxis, setAvailableTaxis] = React.useState<typeof taxis>([]);

	// Simulate loading and fetching taxis
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setAvailableTaxis(taxis);
			setLoading(false);
		}, 2000);

		return () => clearTimeout(timer);
	}, []);

	return (
		<motion.div
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-white shadow-sm">
				<div className="flex items-center gap-2 mb-4">
					<Button isIconOnly variant="light" size="sm" aria-label="Back">
						<Icon icon="lucide:arrow-left" />
					</Button>
					<h2 className="text-lg font-semibold">Available Taxis</h2>
				</div>

				<Card className="mb-4">
					<CardBody className="p-3">
						<div className="flex items-start gap-3">
							<div className="flex flex-col items-center">
								<div className="w-3 h-3 rounded-full bg-primary" />
								<div className="w-0.5 h-10 bg-default-200" />
								<div className="w-3 h-3 rounded-full bg-danger" />
							</div>

							<div className="flex-1">
								<div className="mb-2">
									<div className="text-sm font-medium">Pickup</div>
									<div className="text-xs text-default-500">{pickupLocation}</div>
								</div>

								<div>
									<div className="text-sm font-medium">Drop-off</div>
									<div className="text-xs text-default-500">
										{dropoffLocation}
									</div>
								</div>
							</div>

							<Button
								size="sm"
								variant="light"
								isIconOnly
								aria-label="Edit locations">
								<Icon icon="lucide:edit" />
							</Button>
						</div>
					</CardBody>
				</Card>
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
				{loading ? (
					<div className="flex flex-col items-center justify-center h-full">
						<Spinner color="primary" size="lg" />
						<p className="text-default-500 mt-4">Finding available taxis...</p>
					</div>
				) : (
					<div className="space-y-4">
						<p className="text-sm text-default-500 mb-2">
							{availableTaxis.length} taxis available near your location
						</p>

						{availableTaxis.map((taxi) => (
							<TaxiCard
								key={taxi.id}
								taxi={taxi}
								onSelect={() => onTaxiSelect(taxi.id)}
							/>
						))}

						<div className="bg-default-50 p-3 rounded-medium mt-6">
							<div className="flex items-start gap-3">
								<Icon icon="lucide:info" className="text-primary mt-0.5" />
								<div>
									<h4 className="text-sm font-medium">Payment Options</h4>
									<p className="text-xs text-default-500 mt-1">
										Cash payment is accepted on all taxis. For added security,
										you can also scan the driver's QR code to confirm your ride.
									</p>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</motion.div>
	);
};

interface TaxiCardProps {
	taxi: (typeof taxis)[0];
	onSelect: () => void;
}

const TaxiCard: React.FC<TaxiCardProps> = ({ taxi, onSelect }) => {
	return (
		<Card className="shadow-sm">
			<CardBody className="p-4">
				<div className="flex justify-between items-start">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-default-100 rounded-full flex items-center justify-center">
							<Icon icon="lucide:user" className="text-2xl text-default-400" />
						</div>

						<div>
							<h3 className="font-medium">{taxi.driverName}</h3>
							<div className="flex items-center text-xs text-default-500 mt-1">
								<Icon icon="lucide:star" className="text-warning mr-1" />
								<span>{taxi.rating}</span>
							</div>
						</div>
					</div>

					<div className="text-right">
						<div className="text-xs font-medium text-primary">{taxi.distance}</div>
						<div className="text-xs text-default-500 mt-1">ETA: {taxi.eta}</div>
					</div>
				</div>

				<div className="mt-3 text-sm">
					<div className="flex items-center gap-2">
						<Icon icon="lucide:taxi" className="text-default-500" />
						<span>{taxi.vehicleInfo}</span>
					</div>
					<div className="flex items-center gap-2 mt-1">
						<Icon icon="lucide:tag" className="text-default-500" />
						<span>{taxi.licensePlate}</span>
					</div>
				</div>

				<Divider className="my-3" />

				<div className="flex justify-between items-center">
					<div className="flex items-center text-xs text-default-500">
						<Icon icon="lucide:credit-card" className="mr-1" />
						<span>Cash & QR payment</span>
					</div>

					<Button color="primary" size="sm" onPress={onSelect}>
						Select Taxi
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};
