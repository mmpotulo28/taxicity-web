"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { taxis } from "@/lib/data";
import TaxiMap from "@/components/TaxiMap";
import { useRide } from "@/context/RideContext";

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
			animate={{ opacity: 1 }}
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			transition={{ duration: 0.3 }}>
			<div className="fixed inset-0 h-full w-full z-0">
				<TaxiMap taxis={availableTaxis} />
			</div>

			<div className="p-1 bg-[rgba(0,0,0,0.3)] shadow-sm z-1 backdrop-blur-sm">
				<div className="flex items-center gap-2 mb-4">
					<Button isIconOnly aria-label="Back" size="sm" variant="light">
						<Icon className="h-6 w-6" icon="lucide:arrow-left" />
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
								isIconOnly
								aria-label="Edit locations"
								size="sm"
								variant="light">
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
							className="fixed bottom-18 left-5 px-4 animate-bounce"
							color="secondary"
							endContent={<Icon className="h-5 w-5 " icon="lucide:bus" />}
							size="lg"
							variant="solid"
							onPress={handleRequestRide}>
							Request
						</Button>

						<div className="bg-default-50 p-3 rounded-medium mt-6">
							<div className="flex items-start gap-3">
								<Icon className="text-primary mt-0.5" icon="lucide:info" />
								<div>
									<h4 className="text-sm font-medium">Payment Options</h4>
									<p className="text-xs text-default-500 mt-1">
										Cash payment is accepted on all taxis. You will confirm your
										taxi by scanning the driver&apos;s QR code once they arrive.
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
