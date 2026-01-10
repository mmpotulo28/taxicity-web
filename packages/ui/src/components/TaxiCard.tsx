"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { useRide } from "../context/RideContext";
import { iTaxi } from "../types";

interface TaxiCardProps {
	taxi: iTaxi;
}

const TaxiCard: React.FC<TaxiCardProps> = ({ taxi }) => {
	const router = useRouter();
	const { setSelectedTaxi, requestRide } = useRide();

	const handleSelectTaxi = async () => {
		setSelectedTaxi(taxi);
		await requestRide();
		router.push("/ride/track");
	};

	// Generate star rating display
	const renderRating = () => {
		const fullStars = Math.floor(taxi.rating);
		const hasHalfStar = taxi.rating % 1 >= 0.5;

		return (
			<div className="flex items-center">
				{[...Array(fullStars)].map((_, i) => (
					<Icon key={`star-${i}`} className="text-yellow-500" icon="lucide:star" />
				))}

				{hasHalfStar && <Icon className="text-yellow-500" icon="lucide:star-half" />}

				{[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
					<Icon key={`empty-star-${i}`} className="text-default-300" icon="lucide:star" />
				))}

				<span className="ml-1 text-xs">{taxi.rating.toFixed(1)}</span>
			</div>
		);
	};

	return (
		<Card className="shadow-sm w-full">
			<CardBody className="p-4">
				<div className="flex justify-between items-start">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-default-100 rounded-full flex items-center justify-center">
							<Icon className="text-2xl text-default-400" icon="lucide:taxi" />
						</div>

						<div>
							<h3 className="font-medium">{taxi.driver}</h3>
							<p className="text-xs text-default-500">{taxi.model}</p>
							<div className="mt-1">{renderRating()}</div>
						</div>
					</div>

					<Chip color="success" variant="flat">
						Available
					</Chip>
				</div>

				<div className="grid grid-cols-2 gap-2 mt-4 text-xs text-default-500">
					<div className="flex items-center gap-1">
						<Icon icon="lucide:users" />
						<span>Capacity: {taxi.capacity}</span>
					</div>

					<div className="flex items-center gap-1">
						<Icon icon="lucide:tag" />
						<span>{taxi.licensePlate}</span>
					</div>
				</div>

				<div className="flex justify-between items-center mt-4">
					<div className="flex items-center gap-1 text-xs text-primary">
						<Icon icon="lucide:phone" />
						<span>{taxi.phone}</span>
					</div>

					<Button
						color="primary"
						endContent={<Icon icon="lucide:check" />}
						onPress={handleSelectTaxi}>
						Select Taxi
					</Button>
				</div>
			</CardBody>
		</Card>
	);
};

export default TaxiCard;
