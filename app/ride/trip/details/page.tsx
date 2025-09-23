"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Alert, Button, Card, CardBody, Divider, Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRide } from "@/context/RideContext";
import { useRouter } from "next/navigation";
import TripCard from "@/components/TripCard";

const TripDetails: React.FC = () => {
	const { trip, tripStarted, startTrip, endTrip } = useRide();
	const router = useRouter();
	const [progress, setProgress] = React.useState(0);
	const [remainingTime, setRemainingTime] = React.useState(15);
	const [showPayment, setShowPayment] = React.useState(false);
	const [showQR, setShowQR] = React.useState(!tripStarted);

	// Redirect if trip not started
	useEffect(() => {
		if (!trip) {
			router.replace("/ride/route");
		}
	}, [trip, router]);

	// Start trip after QR code is scanned
	const handleConfirmRideStarted = () => {
		const success = startTrip();
		if (success) {
			setShowQR(false);
			setProgress(0);
			setRemainingTime(15);
			setShowPayment(false);
		}
	};

	// Simulate trip progress only after trip is started
	useEffect(() => {
		if (!tripStarted) return;
		const interval = setInterval(() => {
			setProgress((prev) => {
				const newProgress = prev + 5;
				if (newProgress >= 100) {
					clearInterval(interval);
					setShowPayment(true);
					return 100;
				}
				return newProgress;
			});
			setRemainingTime((prev) => {
				const newTime = prev - 0.75;
				return Math.max(newTime, 0);
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [tripStarted]);

	const onRideComplete = () => {
		endTrip();
		router.push("/ride/trip/history");
		alert("Trip completed! Thank you for riding with us.");
	};

	// If no trip object, show a message
	if (!trip) {
		return (
			<motion.div
				className="h-full flex flex-col items-center justify-center"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3 }}>
				<Icon icon="lucide:alert-triangle" className="text-4xl text-danger mb-2" />
				<p className="text-default-500 text-center">
					No trip found. Please start a ride from the home page.
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
				<h2 className="text-lg font-semibold mb-2">Your Trip</h2>
				<p className="text-default-500 text-sm mb-4">
					{showPayment
						? "You've arrived at your destination"
						: !tripStarted
							? "Scan QR code to start your trip"
							: "On the way to your destination"}
				</p>

				{tripStarted && !showPayment && (
					<>
						<Progress
							value={progress}
							color="primary"
							className="mb-2"
							aria-label="Trip progress"
						/>
						<div className="flex justify-between text-xs text-default-500 mb-4">
							<span>In progress</span>
							<span>{remainingTime.toFixed(0)} min remaining</span>
						</div>
					</>
				)}

				<TripCard key={trip.id} trip={trip} onSelect={() => {}} />
			</div>

			<div className="flex-1 overflow-y-auto p-4 scrollbar-hidden space-y-4">
				{showQR && (
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
						<Button
							color="primary"
							className="w-full"
							onPress={handleConfirmRideStarted}>
							Confirm Ride Started
						</Button>
					</motion.div>
				)}

				{tripStarted && showPayment ? (
					<motion.div
						className="space-y-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}>
						<Card className="shadow-sm">
							<CardBody className="p-4">
								<h3 className="text-lg font-semibold mb-2">Payment</h3>
								<div className="space-y-2 mb-4">
									<div className="flex justify-between">
										<span className="text-default-500">Base fare</span>
										<span>{trip.fare}</span>
									</div>
									<Divider className="my-2" />
									<div className="flex justify-between font-medium">
										<span>Total</span>
										<span>{trip.fare}</span>
									</div>
								</div>
								<Alert
									color="warning"
									title="Cash Payment"
									description="Please pay the driver directly with cash. Exact change is appreciated."
									className="mb-4"
								/>
								<Button
									color="primary"
									className="w-full mb-2"
									onPress={onRideComplete}>
									Complete Trip
								</Button>
								<Button
									variant="flat"
									color="primary"
									className="w-full"
									startContent={<Icon icon="lucide:qr-code" />}>
									Show Payment QR Code
								</Button>
							</CardBody>
						</Card>
						<Card>
							<CardBody className="p-4">
								<h3 className="font-medium mb-3">Rate your trip</h3>
								<div className="flex justify-center gap-2 mb-4">
									{[1, 2, 3, 4, 5].map((star) => (
										<Button
											key={star}
											isIconOnly
											variant="light"
											className="text-warning">
											<Icon icon="lucide:star" className="text-2xl" />
										</Button>
									))}
								</div>
								<Button
									variant="light"
									color="primary"
									className="w-full"
									startContent={<Icon icon="lucide:message-square" />}>
									Leave Feedback
								</Button>
							</CardBody>
						</Card>
					</motion.div>
				) : (
					tripStarted && (
						<div className="space-y-4">
							<Card>
								<CardBody className="p-4">
									<div className="flex items-center gap-3 mb-3">
										<div className="w-10 h-10 bg-default-100 rounded-full flex items-center justify-center">
											<Icon
												icon="lucide:user"
												className="text-xl text-default-400"
											/>
										</div>
										<div>
											<h3 className="font-medium">{trip.driver}</h3>
											<div className="flex items-center text-xs text-default-500">
												<Icon
													icon="lucide:star"
													className="text-warning mr-1"
												/>
												<span>4.8</span>
											</div>
										</div>
										<Button
											isIconOnly
											variant="flat"
											color="primary"
											className="ml-auto"
											aria-label="Call driver">
											<Icon icon="lucide:phone" />
										</Button>
									</div>
									<div className="grid grid-cols-2 gap-2 text-sm">
										<div>
											<div className="text-default-500">Vehicle</div>
											<div>{trip.vehicle}</div>
										</div>
										<div>
											<div className="text-default-500">License Plate</div>
											<div>{trip.licensePlate}</div>
										</div>
									</div>
								</CardBody>
							</Card>
							<div className="bg-default-50 p-3 rounded-medium">
								<div className="flex items-start gap-3">
									<Icon icon="lucide:info" className="text-primary mt-0.5" />
									<div>
										<h4 className="text-sm font-medium">Trip Information</h4>
										<ul className="text-xs text-default-500 mt-1 space-y-1">
											<li>
												<span className="font-medium">Estimated fare:</span>{" "}
												{trip.fare}
											</li>
											<li>
												<span className="font-medium">Payment method:</span>{" "}
												{trip.paymentMethod}
											</li>
										</ul>
									</div>
								</div>
							</div>
							<Button
								color="danger"
								variant="light"
								className="w-full"
								startContent={<Icon icon="lucide:alert-triangle" />}>
								Emergency Assistance
							</Button>
						</div>
					)
				)}
			</div>
		</motion.div>
	);
};

export default TripDetails;
