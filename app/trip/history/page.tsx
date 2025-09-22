import React from "react";
import { motion } from "framer-motion";
import {
	Button,
	Card,
	CardBody,
	Divider,
	Input,
	Tabs,
	Tab,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";

// Sample trip history data
const tripHistory = [
	{
		id: "trip-001",
		date: "2023-06-15",
		time: "14:30",
		route: "CBD to Soweto",
		pickup: "Bree Street Taxi Rank",
		dropoff: "Soweto Mall",
		driver: "Sipho Mabena",
		vehicle: "Toyota Quantum - White",
		licensePlate: "GP 123-456",
		fare: "R25.40",
		status: "completed",
		paymentMethod: "Cash",
	},
	{
		id: "trip-002",
		date: "2023-06-10",
		time: "09:15",
		route: "Sandton to Alexandra",
		pickup: "Sandton City",
		dropoff: "Alexandra Taxi Rank",
		driver: "Thabo Ndlovu",
		vehicle: "Toyota HiAce - Silver",
		licensePlate: "GP 789-012",
		fare: "R18.50",
		status: "completed",
		paymentMethod: "QR Code",
	},
	{
		id: "trip-003",
		date: "2023-06-05",
		time: "17:45",
		route: "Pretoria to Johannesburg",
		pickup: "Pretoria Station",
		dropoff: "Park Station",
		driver: "Mandla Khumalo",
		vehicle: "Nissan Impendulo - White",
		licensePlate: "GP 345-678",
		fare: "R35.00",
		status: "completed",
		paymentMethod: "Cash",
	},
	{
		id: "trip-004",
		date: "2023-05-28",
		time: "11:20",
		route: "Randburg to Midrand",
		pickup: "Randburg Mall",
		dropoff: "Midrand Gautrain Station",
		driver: "Bongani Zulu",
		vehicle: "Toyota Quantum - Silver",
		licensePlate: "GP 901-234",
		fare: "R30.00",
		status: "completed",
		paymentMethod: "Cash",
	},
	{
		id: "trip-005",
		date: "2023-05-20",
		time: "08:00",
		route: "Roodepoort to Krugersdorp",
		pickup: "Roodepoort CBD",
		dropoff: "Krugersdorp Taxi Rank",
		driver: "Themba Nkosi",
		vehicle: "Toyota HiAce - White",
		licensePlate: "GP 567-890",
		fare: "R22.50",
		status: "completed",
		paymentMethod: "QR Code",
	},
];

export const TripHistory: React.FC = () => {
	const [searchQuery, setSearchQuery] = React.useState("");
	const [selectedTrip, setSelectedTrip] = React.useState<(typeof tripHistory)[0] | null>(null);
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

	const filteredTrips = React.useMemo(() => {
		if (!searchQuery) return tripHistory;

		const query = searchQuery.toLowerCase();
		return tripHistory.filter(
			(trip) =>
				trip.route.toLowerCase().includes(query) ||
				trip.pickup.toLowerCase().includes(query) ||
				trip.dropoff.toLowerCase().includes(query) ||
				trip.driver.toLowerCase().includes(query) ||
				trip.date.includes(query),
		);
	}, [searchQuery]);

	const handleTripSelect = (trip: (typeof tripHistory)[0]) => {
		setSelectedTrip(trip);
		onOpen();
	};

	return (
		<motion.div
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-white shadow-sm">
				<h2 className="text-lg font-semibold mb-4">Trip History</h2>
				<Input
					placeholder="Search trips"
					value={searchQuery}
					onValueChange={setSearchQuery}
					startContent={<Icon icon="lucide:search" className="text-default-400" />}
					className="mb-2"
				/>

				<Tabs aria-label="Trip options" color="primary" variant="underlined">
					<Tab key="all" title="All Trips" />
					<Tab key="completed" title="Completed" />
					<Tab key="cancelled" title="Cancelled" />
				</Tabs>
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
				{filteredTrips.length > 0 ? (
					<div className="space-y-3">
						{filteredTrips.map((trip) => (
							<TripCard
								key={trip.id}
								trip={trip}
								onSelect={() => handleTripSelect(trip)}
							/>
						))}
					</div>
				) : (
					<div className="text-center py-8">
						<Icon
							icon="lucide:search-x"
							className="text-4xl text-default-300 mx-auto mb-2"
						/>
						<p className="text-default-500">No trips found matching "{searchQuery}"</p>
					</div>
				)}
			</div>

			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">Trip Details</ModalHeader>
							<ModalBody>
								{selectedTrip && (
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<div>
												<h3 className="font-medium">
													{selectedTrip.route}
												</h3>
												<p className="text-xs text-default-500">
													{selectedTrip.date} • {selectedTrip.time}
												</p>
											</div>
											<div className="bg-success-100 text-success-600 text-xs px-2 py-0.5 rounded-full">
												{selectedTrip.status}
											</div>
										</div>

										<div className="flex items-start gap-3">
											<div className="flex flex-col items-center">
												<div className="w-3 h-3 rounded-full bg-primary" />
												<div className="w-0.5 h-10 bg-default-200" />
												<div className="w-3 h-3 rounded-full bg-danger" />
											</div>

											<div className="flex-1">
												<div className="mb-2">
													<div className="text-sm font-medium">
														Pickup
													</div>
													<div className="text-xs text-default-500">
														{selectedTrip.pickup}
													</div>
												</div>

												<div>
													<div className="text-sm font-medium">
														Drop-off
													</div>
													<div className="text-xs text-default-500">
														{selectedTrip.dropoff}
													</div>
												</div>
											</div>
										</div>

										<Divider />

										<div>
											<h4 className="text-sm font-medium mb-2">
												Driver Information
											</h4>
											<div className="flex items-center gap-3 mb-2">
												<div className="w-10 h-10 bg-default-100 rounded-full flex items-center justify-center">
													<Icon
														icon="lucide:user"
														className="text-xl text-default-400"
													/>
												</div>
												<div>
													<p className="font-medium">
														{selectedTrip.driver}
													</p>
													<p className="text-xs text-default-500">
														{selectedTrip.vehicle}
													</p>
												</div>
											</div>
											<p className="text-xs text-default-500">
												License Plate: {selectedTrip.licensePlate}
											</p>
										</div>

										<Divider />

										<div>
											<h4 className="text-sm font-medium mb-2">
												Payment Details
											</h4>
											<div className="flex justify-between">
												<span className="text-default-500">Total Fare</span>
												<span className="font-medium">
													{selectedTrip.fare}
												</span>
											</div>
											<div className="flex justify-between mt-1">
												<span className="text-default-500">
													Payment Method
												</span>
												<span>{selectedTrip.paymentMethod}</span>
											</div>
										</div>
									</div>
								)}
							</ModalBody>
							<ModalFooter>
								<Button color="danger" variant="light" onPress={onClose}>
									Close
								</Button>
								<Button
									color="primary"
									onPress={onClose}
									startContent={<Icon icon="lucide:repeat" />}>
									Book Similar Trip
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</motion.div>
	);
};

interface TripCardProps {
	trip: (typeof tripHistory)[0];
	onSelect: () => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onSelect }) => {
	return (
		<Card className="shadow-sm" isPressable onPress={onSelect}>
			<CardBody className="p-4">
				<div className="flex justify-between items-start">
					<div>
						<div className="flex items-center gap-2">
							<Icon icon="lucide:route" className="text-primary" />
							<h3 className="font-medium">{trip.route}</h3>
						</div>
						<div className="flex items-center gap-2 mt-1 text-default-500 text-xs">
							<Icon icon="lucide:calendar" className="text-default-400" />
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

				<Divider className="my-3" />

				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2 text-xs text-default-500">
						<Icon icon="lucide:user" className="text-default-400" />
						<span>{trip.driver}</span>
					</div>
					<Button
						size="sm"
						variant="light"
						color="primary"
						endContent={<Icon icon="lucide:chevron-right" />}
						onPress={onSelect}>
						Details
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};
