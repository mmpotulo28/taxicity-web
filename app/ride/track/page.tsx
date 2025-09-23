"use client";
import React, { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody, Divider, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRide } from "@/context/RideContext";
import { useRouter } from "next/navigation";

const RideTracker: FC = () => {
	const { pickupLocation, selectedTaxi, startTrip, tripStarted } = useRide();
	const router = useRouter();
	const [progress, setProgress] = useState(0);
	const [status, setStatus] = useState("Driver is on the way");
	const [showQR, setShowQR] = useState(false);

	// Redirect if required state is missing
	useEffect(() => {
		if (!selectedTaxi || !pickupLocation) {
			router.replace("/ride/route");
		}
	}, [selectedTaxi, pickupLocation, router]);

	// Simulate taxi approaching
	useEffect(() => {
		const interval = setInterval(() => {
			setProgress((prev) => {
				const newProgress = prev + 10;

				if (newProgress === 50) {
					setStatus("Driver is arriving soon");
				}

				if (newProgress >= 100) {
					setStatus("Driver has arrived");
					clearInterval(interval);
				}

				return Math.min(newProgress, 100);
			});
		}, 1500);

		return () => clearInterval(interval);
	}, []);

	const onRideStart = () => {
		const success = startTrip();
		if (success) {
			setStatus("Enjoy your ride!");
			setShowQR(false);
			router.push("/ride/trip/details");
		}
	};

	// If no taxi selected, show message
	if (!selectedTaxi) {
		return (
			<motion.div
				className="h-full flex flex-col items-center justify-center"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3 }}>
				<Icon icon="lucide:alert-triangle" className="text-4xl text-danger mb-2" />
				<p className="text-default-500 text-center">
					No taxi selected. Please select a taxi to continue.
				</p>
			</motion.div>
		);
	}

	return (
		<motion.div
			className="h-full flex flex-col"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}>
			<div className="p-4 bg-white shadow-sm">
				<h2 className="text-lg font-semibold mb-2">Your Taxi is Coming</h2>
				<p className="text-default-500 text-sm mb-4">{status}</p>

				<Progress
					value={progress}
					color="primary"
					className="mb-4"
					aria-label="Taxi arrival progress"
				/>

				<Card className="mb-4">
					<CardBody className="p-3">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 bg-default-100 rounded-full flex items-center justify-center">
								<Icon icon="lucide:user" className="text-2xl text-default-400" />
							</div>

							<div className="flex-1">
								<h3 className="font-medium">{selectedTaxi.driverName}</h3>
								<div className="flex items-center text-xs text-default-500 mt-1">
									<Icon icon="lucide:star" className="text-warning mr-1" />
									<span>{selectedTaxi.rating}</span>
								</div>
							</div>

							<div className="flex gap-2">
								<Button
									isIconOnly
									variant="flat"
									color="primary"
									aria-label="Call driver">
									<Icon icon="lucide:phone" />
								</Button>
								<Button
									isIconOnly
									variant="flat"
									color="primary"
									aria-label="Message driver">
									<Icon icon="lucide:message-square" />
								</Button>
							</div>
						</div>

						<Divider className="my-3" />

						<div className="grid grid-cols-2 gap-2 text-sm">
							<div>
								<div className="text-default-500">Vehicle</div>
								<div>{selectedTaxi.vehicleInfo}</div>
							</div>
							<div>
								<div className="text-default-500">License Plate</div>
								<div>{selectedTaxi.licensePlate}</div>
							</div>
						</div>
					</CardBody>
				</Card>
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
				<Card className="mb-4">
					<CardBody className="p-3">
						<div className="flex items-start gap-3">
							<div className="flex flex-col items-center">
								<div className="w-3 h-3 rounded-full bg-primary" />
								<div className="w-0.5 h-6 bg-default-200" />
							</div>

							<div className="flex-1">
								<div className="text-sm font-medium">Pickup Location</div>
								<div className="text-xs text-default-500">{pickupLocation}</div>
							</div>
						</div>
					</CardBody>
				</Card>

				{showQR ? (
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
							Scan this QR code when you meet your driver to confirm your ride
						</p>

						<Button color="primary" className="w-full" onPress={onRideStart}>
							Confirm Ride Started
						</Button>
					</motion.div>
				) : (
					<div className="space-y-4">
						<div className="bg-default-50 p-3 rounded-medium">
							<div className="flex items-start gap-3">
								<Icon icon="lucide:info" className="text-primary mt-0.5" />
								<div>
									<h4 className="text-sm font-medium">Safety Tips</h4>
									<ul className="text-xs text-default-500 mt-1 list-disc pl-4 space-y-1">
										<li>Verify the driver's name and vehicle details</li>
										<li>Share your trip details with a trusted contact</li>
										<li>Sit in the back seat if traveling alone</li>
										<li>Use the in-app emergency button if needed</li>
									</ul>
								</div>
							</div>
						</div>

						<Button
							color="primary"
							variant="flat"
							className="w-full"
							onPress={() => setShowQR(true)}
							startContent={<Icon icon="lucide:qr-code" />}
							isDisabled={progress < 100}>
							{progress < 100
								? "QR Code Available When Driver Arrives"
								: "Show QR Code"}
						</Button>

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
