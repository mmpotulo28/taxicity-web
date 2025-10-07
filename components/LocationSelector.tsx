import React, { useEffect } from "react";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";

import { useMap } from "@/context/MapContext";
import { useRide } from "@/context/RideContext";

interface LocationSelectorProps {
	type: "pickup" | "dropoff";
	onSelect: (address: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ type, onSelect }) => {
	const {
		setSelectionMode,
		selectionMode,
		pickupMarker,
		dropoffMarker,
		getAddressFromLatLng,
		userLocation,
	} = useMap();

	const { ranks, selectedRoute } = useRide();

	// When a marker is set, get the address and call onSelect
	useEffect(() => {
		const updateAddress = async () => {
			if (type === "pickup" && pickupMarker) {
				const address = await getAddressFromLatLng(pickupMarker);
				onSelect(address);
			} else if (type === "dropoff" && dropoffMarker) {
				const address = await getAddressFromLatLng(dropoffMarker);
				onSelect(address);
			}
		};

		updateAddress();
	}, [type, pickupMarker, dropoffMarker, getAddressFromLatLng, onSelect]);

	// Helper to use current location as pickup
	const useCurrentLocation = async () => {
		if (!userLocation) return;

		if (type === "pickup") {
			const address = await getAddressFromLatLng(userLocation);
			onSelect(address);
		}
	};

	// Helper to use rank location
	const useRankLocation = async () => {
		if (!selectedRoute) return;

		const rank = ranks.find((r) => r.id === selectedRoute.rankId);
		if (rank && type === "pickup") {
			const address = await getAddressFromLatLng(rank.coordinates);
			onSelect(rank.name + " - " + address);
		}
	};

	const handleActivate = () => {
		setSelectionMode(type);
	};

	const isActive = selectionMode === type;

	return (
		<div
			className={`p-3 rounded-lg ${isActive ? "bg-background/90 shadow-lg" : "bg-background/70"}`}>
			<div className="flex items-center gap-2 mb-2">
				<div
					className={`w-8 h-8 rounded-full ${type === "pickup" ? "bg-primary/10" : "bg-danger/10"} flex items-center justify-center`}>
					<div
						className={`w-3 h-3 rounded-full ${type === "pickup" ? "bg-primary" : "bg-danger"}`}
					/>
				</div>
				<label className="text-sm font-medium">
					{type === "pickup" ? "Pickup Location" : "Drop-off Location"}
				</label>
			</div>

			<Button
				className="w-full mb-2"
				color={type === "pickup" ? "primary" : "danger"}
				endContent={<Icon icon="lucide:map-pin" />}
				variant={isActive ? "solid" : "flat"}
				onPress={handleActivate}>
				{isActive ? "Selecting..." : "Select on Map"}
			</Button>

			{type === "pickup" && (
				<div className="flex gap-2">
					<Button
						className="flex-1"
						size="sm"
						variant="flat"
						onPress={useCurrentLocation}>
						<Icon className="mr-1" icon="lucide:navigation" />
						Current Location
					</Button>

					<Button className="flex-1" size="sm" variant="flat" onPress={useRankLocation}>
						<Icon className="mr-1" icon="lucide:home" />
						Use Rank
					</Button>
				</div>
			)}
		</div>
	);
};

export default LocationSelector;
