"use client";
import React, { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody, Divider, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRide } from "@/context/RideContext";
import { useRouter } from "next/navigation";
import TaxiCard from "@/components/TaxiCard";
import { iTaxi } from "@/types";

const RideTracker: FC = () => {
	const { setSelectedTaxi, selectedTaxi, startTrip } = useRide();
	const router = useRouter();
	const [progress, setProgress] = useState(0);
	const [status, setStatus] = useState("Waiting for taxis to accept...");
	const [availableTaxis, setAvailableTaxis] = useState<iTaxi[]>([]);
	const [arrivedTaxi, setArrivedTaxi] = useState<iTaxi | null>(null);
	const [showQR, setShowQR] = useState(false);
	const [canConfirmTrip, setCanConfirmTrip] = useState(false);

	// Load available taxis from sessionStorage
	useEffect(() => {
		const stored = sessionStorage.getItem("taxicity_available_taxis");
		if (stored) {
			setAvailableTaxis(JSON.parse(stored));
		}
	}, []);

	// Simulate taxis approaching, pick one as arrived
	useEffect(() => {
		if (availableTaxis.length === 0) return;
		const interval = setInterval(() => {
			setProgress((prev) => {
				const newProgress = prev + 20;
				if (newProgress >= 100) {
					clearInterval(interval);
					setStatus("A taxi has arrived!");
					// Pick the closest taxi as arrived
					setArrivedTaxi(availableTaxis[0]);
					setShowQR(true);
					return 100;
				}
				setStatus("Taxis are on the way...");
				return Math.min(newProgress, 100);
			});
		}, 1200);

		return () => clearInterval(interval);
	}, [availableTaxis]);

	const handleScanQR = () => {
		if (arrivedTaxi) {
			setSelectedTaxi(arrivedTaxi);
			setShowQR(false);
			setCanConfirmTrip(true);
		}
	};

	const onRideStart = () => {
		const success = startTrip();
		if (success) {
			setStatus("Enjoy your ride!");
			router.push("/ride/trip/details");
		}
	};

	return (
		<motion.div
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-white shadow-sm">
				<h2 className="text-lg font-semibold mb-2">Tracking Your Taxi</h2>
				<p className="text-default-500 text-sm mb-4">{status}</p>

				<Progress
					value={progress}
					color="primary"
					className="mb-4"
					aria-label="Taxi arrival progress"
				/>

				{availableTaxis.length > 0 && (
					<Card className="mb-4">
						<CardBody className="p-3">
							<h3 className="font-medium mb-2">Taxis responding to your request:</h3>
							<div className="space-y-2">
								{availableTaxis.map((taxi, idx) => (
									<TaxiCard key={taxi.id} taxi={taxi} showSelect={false} />
								))}
							</div>
						</CardBody>
					</Card>
				)}
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
				{showQR && arrivedTaxi ? (
					<motion.div
						className="flex flex-col items-center"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3 }}>
						<div className="bg-white p-4 rounded-lg shadow-md mb-4">
							<div
								className="w-64 h-64 bg-cover bg-center"
								style={{
									backgroundImage: `url(https://img.heroui.chat/image/ai?w=300&h=300&u=qr-code)`,
								}}
							/>
						</div>
						<p className="text-center text-sm text-default-500 mb-4">
							Scan the arrived taxi's QR code to confirm you are taking this taxi.
						</p>
						<Button color="primary" className="w-full" onPress={handleScanQR}>
							I've Scanned the Taxi's QR Code
						</Button>
					</motion.div>
				) : canConfirmTrip ? (
					<motion.div
						className="flex flex-col items-center"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3 }}>
						<p className="text-center text-sm text-default-500 mb-4">
							You have scanned the taxi's QR code. Please confirm to start your trip.
						</p>
						<Button color="primary" className="w-full" onPress={onRideStart}>
							Confirm Trip Started
						</Button>
					</motion.div>
				) : (
					<div className="space-y-4">
						<div className="bg-default-50 p-3 rounded-medium">
							<div className="flex items-start gap-3">
								<Icon icon="lucide:info" className="text-primary mt-0.5" />
								<div>
									<h4 className="text-sm font-medium">How it works</h4>
									<ul className="text-xs text-default-500 mt-1 list-disc pl-4 space-y-1">
										<li>Wait for a taxi to arrive</li>
										<li>Scan the arrived taxi's QR code to confirm</li>
										<li>Start your trip once confirmed</li>
									</ul>
								</div>
							</div>
						</div>
						<Button
							color="danger"
							variant="light"
							className="w-full"
							startContent={<Icon icon="lucide:x" />}>
							Cancel Ride
						</Button>
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default RideTracker;
