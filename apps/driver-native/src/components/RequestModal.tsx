import React from "react";
import { View, Text, ScrollView } from "react-native";
import { BottomSheet } from "heroui-native/bottom-sheet";
import { Button } from "heroui-native/button";
import { Chip } from "heroui-native/chip";
import { Feather } from "@expo/vector-icons";
import { Trip } from "../context/DriverContext";

interface RequestModalProps {
	isOpen: boolean;
	onClose: () => void;
	request: Trip | null;
	onAccept: (tripId: string) => Promise<void>;
}

export function RequestModal({
	isOpen,
	onClose,
	request,
	onAccept,
}: RequestModalProps) {
	const [isAccepting, setIsAccepting] = React.useState(false);

	if (!request) return null;

	const handleAccept = async () => {
		setIsAccepting(true);
		try {
			await onAccept(request.id);
			onClose(); // Close modal on success
		} catch (err) {
			console.error(err);
			// Toast is handled in context
		} finally {
			setIsAccepting(false);
		}
	};

	return (
		<BottomSheet isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
			<BottomSheet.Portal>
				<BottomSheet.Overlay />
				<BottomSheet.Content className="pb-8 px-4" snapPoints={["60%", "80%"]}>
					<BottomSheet.Close />
					<View className="mb-4">
						<BottomSheet.Title className="text-xl font-bold text-default-900">New Ride Request</BottomSheet.Title>
						<BottomSheet.Description className="text-default-500">
							{request.distance ? `${request.distance} away` : "Nearby"}
						</BottomSheet.Description>
					</View>

					<ScrollView className="mb-4 flex-1">
						<View className="flex-row justify-between items-center bg-default-50 py-4 rounded-xl mb-6">
							<View className="flex-row items-center gap-3">
								<View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
									<Text className="text-primary font-bold text-lg">
										{request.user?.firstName?.[0] || "U"}
									</Text>
								</View>
								<View>
									<Text className="font-semibold text-base text-default-900">{request.user?.firstName || "Passenger"}</Text>
									<View className="flex-row items-center gap-1 mt-1">
										<Feather name="star" color="#f5a524" size={14} />
										<Text className="text-sm text-default-500">{request.user?.rating || "5.0"}</Text>
									</View>
								</View>
							</View>
							<View className="items-end gap-1">
								<Text className="text-2xl font-bold text-success">
									R{request.fare ? Number(request.fare).toFixed(2) : "0.00"}
								</Text>
								<Chip size="sm" variant="secondary">
									<Text className="text-xs text-default-500 uppercase font-bold">{request.paymentMethod.replace(/_/g, " ")}</Text>
								</Chip>
							</View>
						</View>

						<View className="relative pl-6 pb-2">
							{/* Vertical Line */}
							<View className="absolute left-[9px] top-6 bottom-8 w-0.5 bg-default-200" />
							
							<View className="relative mb-6">
								<View className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-success border-4 border-white z-10" />
								<Text className="text-xs text-default-500 uppercase font-bold mb-1">Pick Up</Text>
								<Text className="text-sm font-medium text-default-900">{request.pickupAddress}</Text>
							</View>
							
							<View className="relative">
								<View className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-danger border-4 border-white z-10" />
								<Text className="text-xs text-default-500 uppercase font-bold mb-1">Drop Off</Text>
								<Text className="text-sm font-medium text-default-900">{request.dropoffAddress}</Text>
							</View>
						</View>
					</ScrollView>

					<View className="flex-col gap-3 mt-2">
						<Button
							variant="primary"
							size="lg"
							className="w-full"
							onPress={handleAccept}
						>
							<Button.Label className="font-bold text-lg text-white">Accept Ride</Button.Label>
						</Button>
						<Button
							variant="ghost"
							size="lg"
							className="w-full"
							onPress={onClose}
						>
							<Button.Label className="text-danger font-medium text-lg">Decline</Button.Label>
						</Button>
					</View>
				</BottomSheet.Content>
			</BottomSheet.Portal>
		</BottomSheet>
	);
}
