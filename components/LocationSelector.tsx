import React, { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Icon } from "@iconify/react";
import { Chip } from "@heroui/chip";
import { useDisclosure } from "@heroui/modal";

import MapSelectionModal from "./MapSelectionModal";

import { useMap } from "@/context/MapContext";
import { useRide } from "@/context/RideContext";

interface LocationSelectorProps {
	type: "pickup" | "dropoff";
	onSelect: (address: string) => void;
	value: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ type, onSelect, value }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { userLocation, getAddressFromLatLng, setPickupMarker, setDropoffMarker } = useMap();

	const { ranks, selectedRoute } = useRide();

	// Use local input state to handle the input field
	const [inputValue, setInputValue] = useState(value);

	// Sync input value with parent state
	useEffect(() => {
		setInputValue(value);
	}, [value]);

	// Handler for popular location selection
	const handlePopularLocation = (location: any) => {
		const fullAddress = `${location.name} - ${location.address}`;

		setInputValue(fullAddress);
		onSelect(fullAddress);

		if (type === "pickup") {
			setPickupMarker({ lat: location.lat, lng: location.lng });
		} else {
			setDropoffMarker({ lat: location.lat, lng: location.lng });
		}
	};

	// Handler for rank selection
	const handleRankSelection = async (rankId: string) => {
		const selectedRank = ranks.find((r) => r.id === rankId);

		if (selectedRank) {
			const address = await getAddressFromLatLng(selectedRank.coordinates);
			const fullAddress = `${selectedRank.name} - ${address}`;

			setInputValue(fullAddress);
			onSelect(fullAddress);

			if (type === "pickup") {
				setPickupMarker(selectedRank.coordinates);
			} else {
				setDropoffMarker(selectedRank.coordinates);
			}
		}
	};

	// Handler for current location
	const useCurrentLocation = async () => {
		if (userLocation) {
			const address = await getAddressFromLatLng(userLocation);

			setInputValue(address);
			onSelect(address);

			if (type === "pickup") {
				setPickupMarker(userLocation);
			} else {
				setDropoffMarker(userLocation);
			}
		}
	};

	// Handler for using rank location
	const useRankLocation = async () => {
		if (selectedRoute) {
			let rankToUse;

			if (ranks.length > 0) {
				// For pickup, use the origin rank
				if (type === "pickup") {
					rankToUse = ranks.find((r) => r.id === selectedRoute.rankId);
				}
				// For dropoff, suggest destination ranks
				else {
					// If selectedRoute has a destination rank, use that
					if (selectedRoute.destinationRankId) {
						rankToUse = ranks.find((r) => r.id === selectedRoute.destinationRankId);
					}
					// Otherwise use the first rank that's not the origin
					else {
						rankToUse = ranks.find((r) => r.id !== selectedRoute.rankId);
					}
				}

				if (rankToUse) {
					const address = await getAddressFromLatLng(rankToUse.coordinates);
					const fullAddress = `${rankToUse.name} - ${address}`;

					setInputValue(fullAddress);
					onSelect(fullAddress);

					if (type === "pickup") {
						setPickupMarker(rankToUse.coordinates);
					} else {
						setDropoffMarker(rankToUse.coordinates);
					}
				}
			}
		}
	};

	// Get list of available ranks, excluding the origin rank for dropoff
	const availableRanks = ranks.filter((r) => {
		if (type === "pickup") {
			return true; // Show all ranks for pickup
		} else {
			// For dropoff, don't show the origin rank if it's already selected
			return selectedRoute?.rankId !== r.id;
		}
	});

	// Handle input change
	const handleInputChange = (value: string) => {
		setInputValue(value);
		onSelect(value);
	};

	// Handle selection from map modal
	const handleMapSelection = (address: string) => {
		setInputValue(address);
		onSelect(address);
		onClose();
	};

	return (
		<div className="mb-4">
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

			<div className="flex mb-10">
				<Input
					className="flex-1"
					placeholder={type === "pickup" ? "Where are you?" : "Where are you going?"}
					value={inputValue}
					onValueChange={handleInputChange}
				/>
				<Button
					isIconOnly
					aria-label={`Select ${type} on map`}
					className="ml-2"
					color={type === "pickup" ? "primary" : "danger"}
					variant="flat"
					onPress={onOpen}>
					<Icon icon="lucide:map-pin" />
				</Button>
			</div>

			{/* Popular locations and ranks section */}
			<div className="mb-3">
				<p className="text-xs text-default-500 mb-2">Popular locations:</p>
				<div className="flex flex-wrap gap-2">
					{/* Popular locations */}
					{selectedRoute?.popularLocations?.map((location) => (
						<Chip
							key={location.id}
							className="cursor-pointer"
							color={type === "pickup" ? "primary" : "danger"}
							radius="sm"
							size="sm"
							variant="flat"
							onClick={() => handlePopularLocation(location)}>
							{location.name}
						</Chip>
					))}

					{/* Rank locations */}
					{availableRanks.map((rank) => (
						<Chip
							key={rank.id}
							className="cursor-pointer"
							color={type === "pickup" ? "primary" : "danger"}
							radius="sm"
							size="sm"
							variant="dot"
							onClick={() => handleRankSelection(rank.id)}>
							{rank.name}
						</Chip>
					))}
				</div>
			</div>

			<div className="flex gap-2 mt-10">
				<Button
					className="flex-1"
					color={type === "pickup" ? "primary" : "danger"}
					size="sm"
					startContent={<Icon icon="lucide:navigation" />}
					variant="flat"
					onPress={useCurrentLocation}>
					Current Location
				</Button>

				<Button
					className="flex-1"
					color={type === "pickup" ? "primary" : "danger"}
					isDisabled={!selectedRoute}
					size="sm"
					startContent={<Icon icon="lucide:home" />}
					variant="flat"
					onPress={useRankLocation}>
					Use {type === "pickup" ? "Origin" : "Destination"} Rank
				</Button>
			</div>

			<MapSelectionModal
				isOpen={isOpen}
				type={type}
				onClose={onClose}
				onSelect={handleMapSelection}
			/>
		</div>
	);
};

export default LocationSelector;
