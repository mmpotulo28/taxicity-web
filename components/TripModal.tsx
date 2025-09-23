import { iTrip } from "@/types";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

export interface TripModalProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	trip: iTrip | null;
}

const TripModal: React.FC<TripModalProps> = ({ isOpen, onOpenChange, trip }) => {
	const router = useRouter();
	const onBookSimilar = () => {
		onOpenChange(false);

		addToast({
			title: "Book Similar Trip",
			description: "This feature is coming soon!",
			color: "primary",
		});

		// Logic to book a similar trip
		router.push("/ride/route");
	};
	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">Trip Details</ModalHeader>
						<ModalBody>
							{trip && (
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-medium">{trip.route}</h3>
											<p className="text-xs text-default-500">
												{trip.date} • {trip.time}
											</p>
										</div>
										<div className="bg-success-100 text-success-600 text-xs px-2 py-0.5 rounded-full">
											{trip.status}
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
												<div className="text-sm font-medium">Pickup</div>
												<div className="text-xs text-default-500">
													{trip.pickup}
												</div>
											</div>

											<div>
												<div className="text-sm font-medium">Drop-off</div>
												<div className="text-xs text-default-500">
													{trip.dropoff}
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
												<p className="font-medium">{trip.driver}</p>
												<p className="text-xs text-default-500">
													{trip.vehicle}
												</p>
											</div>
										</div>
										<p className="text-xs text-default-500">
											License Plate: {trip.licensePlate}
										</p>
									</div>

									<Divider />

									<div>
										<h4 className="text-sm font-medium mb-2">
											Payment Details
										</h4>
										<div className="flex justify-between">
											<span className="text-default-500">Total Fare</span>
											<span className="font-medium">{trip.fare}</span>
										</div>
										<div className="flex justify-between mt-1">
											<span className="text-default-500">Payment Method</span>
											<span>{trip.paymentMethod}</span>
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
								onPress={onBookSimilar}
								startContent={<Icon icon="lucide:repeat" />}>
								Book Similar Trip
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};

export default TripModal;
