"use client";
import React, { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody, Progress, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { useRide } from "@/context/RideContext";
import TaxiCard from "@/components/TaxiCard";
import { iTaxi } from "@/types";

const RideTracker: FC = () => {
	const { setSelectedTaxi, selectedTaxi, startTrip } = useRide();
	const router = useRouter();
	const [progress, setProgress] = useState(0);
	const [status, setStatus] = useState("Waiting for taxis to accept...");
	const [availableTaxis, setAvailableTaxis] = useState<iTaxi[]>([]);
	const [arrivedTaxi, setArrivedTaxi] = useState<iTaxi | null>(null);
	const [step, setStep] = useState<"waiting" | "arrived" | "qr" | "confirm">("waiting");

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
		setStep("waiting");
		setProgress(0);
		setArrivedTaxi(null);
		setStatus("Waiting for taxis to accept...");
		const interval = setInterval(() => {
			setProgress((prev) => {
				const newProgress = prev + 25;

				if (newProgress >= 100) {
					clearInterval(interval);
					setStatus("A taxi has arrived!");
					setArrivedTaxi(availableTaxis[0]);
					setStep("arrived");

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
			setStep("qr");
		}
	};

	const onRideStart = () => {
		const success = startTrip();

		if (success) {
			router.push("/ride/trip/details");
		}
	};

	return (
		<motion.div
			animate={{ opacity: 1 }}
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-background shadow-sm">
				<h2 className="text-lg font-semibold mb-2">Track Your Taxi</h2>
				{step === "waiting" && (
					<>
						<p className="text-default-500 text-sm mb-4">{status}</p>
						<Progress
							aria-label="Taxi arrival progress"
							className="mb-4"
							color="primary"
							value={progress}
						/>
						<Card className="mb-4">
							<CardBody className="p-3">
								<h3 className="font-medium mb-2">
									Taxis responding to your request:
								</h3>
								{availableTaxis.length === 0 ? (
									<div className="flex flex-col items-center py-8">
										<Spinner color="primary" />
										<p className="text-default-500 mt-4">
											Waiting for taxis...
										</p>
									</div>
								) : (
									<div className="space-y-2">
										{availableTaxis.map((taxi) => (
											<TaxiCard
												key={taxi.id}
												showSelect={false}
												taxi={taxi}
											/>
										))}
									</div>
								)}
							</CardBody>
						</Card>
						<div className="bg-default-50 p-3 rounded-medium">
							<div className="flex items-start gap-3">
								<Icon className="text-primary mt-0.5" icon="lucide:info" />
								<div>
									<h4 className="text-sm font-medium">How it works</h4>
									<ul className="text-xs text-default-500 mt-1 list-disc pl-4 space-y-1">
										<li>Wait for a taxi to arrive</li>
										<li>You&apos;ll be notified when a taxi is ready</li>
										<li>Scan the arrived taxi&apos;s QR code to confirm</li>
									</ul>
								</div>
							</div>
						</div>
					</>
				)}

				{step === "arrived" && arrivedTaxi && (
					<>
						<Card className="mb-4 border-2 border-primary shadow-lg">
							<CardBody className="p-3">
								<h3 className="font-medium mb-2 text-primary">
									Your taxi has arrived!
								</h3>
								<TaxiCard showSelect={false} taxi={arrivedTaxi} />
								<div className="mt-4 flex flex-col items-center">
									<Button
										className="w-full"
										color="primary"
										startContent={<Icon icon="lucide:qr-code" />}
										onPress={handleScanQR}>
										Scan Driver&apos;s QR Code
									</Button>
									<p className="text-xs text-default-500 mt-2 text-center">
										Please scan the QR code provided by the driver to confirm
										your taxi.
									</p>
								</div>
							</CardBody>
						</Card>
					</>
				)}

				{step === "qr" && selectedTaxi && (
					<>
						<Card className="mb-4">
							<CardBody className="flex flex-col items-center p-4">
								<div className="bg-background p-4 rounded-lg shadow-md mb-4">
									<div
										className="w-64 h-64 bg-cover bg-center"
										style={{
											backgroundImage: `url(https://img.heroui.chat/image/ai?w=300&h=300&u=qr-code)`,
										}}
									/>
								</div>
								<p className="text-center text-sm text-default-500 mb-4">
									You have scanned the taxi&apos;s QR code.
									<br />
									Confirm to start your trip.
								</p>
								<Button className="w-full" color="primary" onPress={onRideStart}>
									Confirm Trip Started
								</Button>
							</CardBody>
						</Card>
					</>
				)}
			</div>
		</motion.div>
	);
};

export default RideTracker;
