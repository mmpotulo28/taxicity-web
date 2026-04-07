import React from "react";
import { View, Text } from "react-native";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { Feather } from "@expo/vector-icons";
import { Button } from "heroui-native/button";

export interface Taxi {
	id: string;
	plateNumber: string;
	model: string;
	make: string;
	color: string;
	capacity: number;
	status: string;
	routeId?: string;
	route?: {
		name: string;
	};
}

interface VehicleCardProps {
	taxi: Taxi;
	onManageRoute?: (taxi: Taxi) => void;
	onEdit?: (taxi: Taxi) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ taxi, onManageRoute, onEdit }) => {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "ACTIVE":
				return "success";
			case "MAINTENANCE":
				return "warning";
			case "INACTIVE":
				return "danger";
			default:
				return "secondary";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "ACTIVE":
				return "check-circle";
			case "MAINTENANCE":
				return "tool";
			case "INACTIVE":
				return "x-circle";
			default:
				return "minus-circle";
		}
	};

	return (
		<Card className="w-full flex flex-col mb-4 overflow-visible">
			<Card.Header className="flex flex-row justify-between items-start pt-6 pb-2">
				<View className="flex flex-row items-center gap-3">
					<View className="w-12 h-12 rounded-xl bg-default-100 flex items-center justify-center">
						<Feather name="truck" size={24} color="#52525b" />
					</View>
					<View className="flex flex-col">
						<Text className="text-xl font-bold">{taxi.plateNumber}</Text>
						<Text className="text-small text-default-500">
							{taxi.make} {taxi.model} • {taxi.color}
						</Text>
					</View>
				</View>
				<Chip
					variant="secondary"
					size="sm"
				>
					<View className="flex-row items-center gap-1">
						<Feather name={getStatusIcon(taxi.status)} size={12} />
						<Text className="text-xs uppercase font-bold">{taxi.status}</Text>
					</View>
				</Chip>
			</Card.Header>
			<Card.Body className="px-6 py-4 flex flex-col gap-4">
				<View className="flex flex-row bg-default-50 rounded-lg p-3 justify-between items-center border border-default-200/50">
					<View className="flex flex-col">
						<Text className="text-xs text-default-500 uppercase font-bold">Assigned Route</Text>
						<Text className="text-sm font-semibold">
							{taxi.route ? taxi.route.name : "Unassigned"}
						</Text>
					</View>
					{taxi.route && (
						<View className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
							<Feather name="map-pin" size={16} color="#006fee" />
						</View>
					)}
				</View>
				<View className="grid grid-cols-2 gap-3 mt-2">
					<View className="flex flex-row items-center gap-3 p-3 bg-default-50 rounded-lg border border-default-200/50">
						<Feather name="users" size={20} color="#71717a" />
						<View>
							<Text className="text-xs text-default-500 uppercase font-bold">Capacity</Text>
							<Text className="text-sm font-bold">{taxi.capacity} Seats</Text>
						</View>
					</View>
					<View className="flex flex-row items-center gap-3 p-3 bg-default-50 rounded-lg border border-default-200/50">
						<Feather name="file-text" size={20} color="#71717a" />
						<View>
							<Text className="text-xs text-default-500 uppercase font-bold">License</Text>
							<Text className="text-sm font-bold text-success flex items-center gap-1">
								Valid <Feather name="check" size={12} />
							</Text>
						</View>
					</View>
					<View className="flex flex-row items-center gap-3 p-3 bg-default-50 rounded-lg border border-default-200/50">
						<Feather name="shield" size={20} color="#71717a" />
						<View>
							<Text className="text-xs text-default-500 uppercase font-bold">Insurance</Text>
							<Text className="text-sm font-bold text-warning flex items-center gap-1">
								Exp: Nov 26 <Feather name="alert-triangle" size={12} />
							</Text>
						</View>
					</View>
					<View className="flex flex-row items-center gap-3 p-3 bg-default-50 rounded-lg border border-default-200/50">
						<Feather name="award" size={20} color="#71717a" />
						<View>
							<Text className="text-xs text-default-500 uppercase font-bold">Permit</Text>
							<Text className="text-sm font-bold text-danger flex items-center gap-1">
								Exp: Oct 25 <Feather name="alert-circle" size={12} />
							</Text>
						</View>
					</View>
				</View>
			</Card.Body>
			<Card.Footer className="px-6 pb-6 pt-2 flex flex-row gap-3">
				<Button
					variant="secondary"
					className="flex-1"
					onPress={() => onManageRoute?.(taxi)}
				>
					<View className="flex-row items-center justify-center gap-2">
						<Feather name="map" size={18} color="#27272a" />
						<Button.Label className="font-medium text-default-700">Manage Route</Button.Label>
					</View>
				</Button>
				<Button
					variant="secondary"
					className="flex-none min-w-[50px] px-0"
					onPress={() => onEdit?.(taxi)}
				>
					<Feather name="edit" size={18} color="#27272a" />
				</Button>
			</Card.Footer>
		</Card>
	);
};
