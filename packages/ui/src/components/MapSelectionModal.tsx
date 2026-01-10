"use client";

import React, { useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";

import { useMap } from "../context/MapContext";
import { MapView } from "./map-view";

interface MapSelectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	type: "pickup" | "dropoff";
	onSelect: (address: string) => void;
}

const MapSelectionModal: React.FC<MapSelectionModalProps> = ({
	isOpen,
	onClose,
	type,
	onSelect,
}) => {
	const { setSelectionMode, pickupMarker, dropoffMarker, getAddressFromLatLng } =
		useMap();

	// Set selection mode when modal opens
	useEffect(() => {
		if (isOpen) {
			// Set a slight delay to ensure modal is fully rendered before setting selection mode
			const timer = setTimeout(() => {
				setSelectionMode(type);
			}, 200);

			return () => clearTimeout(timer);
		} else {
			setSelectionMode(null);
		}
	}, [isOpen, type, setSelectionMode]);

	// Handle confirmation of selection
	const handleConfirm = async () => {
		const marker = type === "pickup" ? pickupMarker : dropoffMarker;

		if (marker) {
			const address = await getAddressFromLatLng(marker);

			onSelect(address);
			onClose();
		}
	};

	// Get the selected marker based on type
	const selectedMarker = type === "pickup" ? pickupMarker : dropoffMarker;

	return (
		<Modal
			className="z-50"
			isOpen={isOpen}
			scrollBehavior="inside"
			size="3xl"
			onClose={() => {
				setSelectionMode(null);
				onClose();
			}}>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">
							Select {type === "pickup" ? "Pickup" : "Drop-off"} Location
						</ModalHeader>
						<ModalBody className="p-0 overflow-hidden relative">
							<div className="w-full h-[400px] relative">
								<MapView
									fullscreen={false}
									height="400px"
									modalMap={true}
									selectionModeOverride={type}
									showTaxis={false}
								/>

								{/* Instructions overlay */}
								<div className="absolute bottom-4 left-0 right-0 flex justify-center">
									<div
										className={`px-4 py-2 rounded-full ${type === "pickup" ? "bg-primary" : "bg-danger"
											} text-white font-medium shadow-lg`}>
										Tap on the map to set{" "}
										{type === "pickup" ? "pickup" : "drop-off"} location
									</div>
								</div>
							</div>
						</ModalBody>
						<ModalFooter className="flex justify-between">
							<Button
								variant="flat"
								onPress={() => {
									setSelectionMode(null);
									onClose();
								}}>
								Cancel
							</Button>
							<Button
								color={type === "pickup" ? "primary" : "danger"}
								endContent={<Icon icon="lucide:check" />}
								isDisabled={!selectedMarker}
								onPress={handleConfirm}>
								Confirm Location
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
};

export default MapSelectionModal;
