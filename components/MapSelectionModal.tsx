import React, { useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";

import { useMap } from "@/context/MapContext";
import { MapView } from "@/components/map-view";

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
	const { setSelectionMode, selectionMode, pickupMarker, dropoffMarker, getAddressFromLatLng } =
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
			isOpen={isOpen}
			onClose={() => {
				setSelectionMode(null);
				onClose();
			}}
			size="3xl"
			scrollBehavior="inside"
			className="z-50">
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">
							Select {type === "pickup" ? "Pickup" : "Drop-off"} Location
						</ModalHeader>
						<ModalBody className="p-0 overflow-hidden relative">
							<div className="w-full h-[400px] relative">
								<MapView
									showTaxis={false}
									fullscreen={false}
									modalMap={true}
									selectionModeOverride={type}
									height="400px"
								/>

								{/* Instructions overlay */}
								<div className="absolute bottom-4 left-0 right-0 flex justify-center">
									<div
										className={`px-4 py-2 rounded-full ${
											type === "pickup" ? "bg-primary" : "bg-danger"
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
								isDisabled={!selectedMarker}
								endContent={<Icon icon="lucide:check" />}
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
