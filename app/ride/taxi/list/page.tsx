"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { taxis } from "@/lib/data";
import TaxiMap from "@/components/TaxiMap";
import { useRide } from "@/context/RideContext";
import { useRouter } from "next/navigation";

const mockTaxiCoords = [
	{ lat: -26.2041, lng: 28.0473 }, // Johannesburg
	{ lat: -26.2023, lng: 28.0456 },
	{ lat: -26.2055, lng: 28.05 },
];

const TaxiList: React.FC = () => {
	const { pickupLocation, dropOffLocation } = useRide();
	const [loading, setLoading] = React.useState(true);
	const [availableTaxis, setAvailableTaxis] = React.useState<any[]>([]);
	const router = useRouter();

	useEffect(() => {
		const timer = setTimeout(() => {
			// Add mock coordinates to each taxi
			setAvailableTaxis(
				taxis.map((taxi, idx) => ({
					...taxi,
					lat: mockTaxiCoords[idx % mockTaxiCoords.length].lat,
					lng: mockTaxiCoords[idx % mockTaxiCoords.length].lng,
				})),
			);
			setLoading(false);
		}, 2000);

		return () => clearTimeout(timer);
	}, []);

	const handleRequestRide = () => {
		sessionStorage.setItem("taxicity_available_taxis", JSON.stringify(availableTaxis));
		router.push("/ride/track");
	};

	return (
		<motion.div
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}>
			<div className="fixed inset-0 h-full w-full z-0">
				<TaxiMap taxis={availableTaxis} />
			</div>

			<div className="p-1 bg-[rgba(0,0,0,0.3)] shadow-sm z-1 backdrop-blur-sm">
				<div className="flex items-center gap-2 mb-4">
					<Button isIconOnly variant="light" size="sm" aria-label="Back">
						<Icon icon="lucide:arrow-left" className="h-6 w-6" />
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
										{dropOffLocation}
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
						<Button
							color="secondary"
							variant="solid"
							size="lg"
							className="fixed bottom-18 left-5 px-4 animate-bounce"
							onPress={handleRequestRide}
							endContent={<Icon icon="lucide:bus" className="h-5 w-5 " />}>
							Request
						</Button>

						<div className="bg-default-50 p-3 rounded-medium mt-6">
							<div className="flex items-start gap-3">
								<Icon icon="lucide:info" className="text-primary mt-0.5" />
								<div>
									<h4 className="text-sm font-medium">Payment Options</h4>
									<p className="text-xs text-default-500 mt-1">
										Cash payment is accepted on all taxis. You will confirm your
										taxi by scanning the driver's QR code once they arrive.
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

export default TaxiList;
