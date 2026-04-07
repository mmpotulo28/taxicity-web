import React, { useState } from "react";
import { View, Text } from "react-native";
import { Card } from "heroui-native/card";
import { Input } from "heroui-native/input";
import { TextField } from "heroui-native/text-field";
import { Label } from "heroui-native/label";
import { Button } from "heroui-native/button";
import { Feather } from "@expo/vector-icons";

export const VehicleRegistration = () => {
	const [formData, setFormData] = useState({
		plateNumber: "",
		make: "",
		model: "",
		year: "",
		color: "",
		capacity: "4",
	});
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (name: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		try {
			// FIXME: connect to api
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log("Submitted:", formData);
		} catch (error) {
			console.error("Error connecting vehicle", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<Card.Header className="flex flex-col gap-1 pb-4 pt-6 px-6">
				<Text className="text-xl font-bold">Vehicle Registration</Text>
				<Text className="text-small text-default-500">
					Register your vehicle to start receiving ride requests
				</Text>
			</Card.Header>
			<Card.Body className="px-6 py-4 flex flex-col gap-4">
				<TextField>
					<Label>License Plate Number</Label>
					<Input
						placeholder="Enter plate number (e.g. ABC 123 GP)"
						variant="secondary"
						value={formData.plateNumber}
						onChangeText={(val) => handleChange("plateNumber", val)}
					/>
				</TextField>

				<View className="flex flex-col gap-4">
					<TextField>
						<Label>Vehicle Make</Label>
						<Input
							placeholder="e.g. Toyota"
							variant="secondary"
							value={formData.make}
							onChangeText={(val) => handleChange("make", val)}
						/>
					</TextField>
					<TextField>
						<Label>Vehicle Model</Label>
						<Input
							placeholder="e.g. Corolla"
							variant="secondary"
							value={formData.model}
							onChangeText={(val) => handleChange("model", val)}
						/>
					</TextField>
				</View>

				<View className="flex flex-col gap-4">
					<TextField>
						<Label>Year</Label>
						<Input
							placeholder="e.g. 2020"
							keyboardType="numeric"
							variant="secondary"
							value={formData.year}
							onChangeText={(val) => handleChange("year", val)}
						/>
					</TextField>
					<TextField>
						<Label>Color</Label>
						<Input
							placeholder="e.g. White"
							variant="secondary"
							value={formData.color}
							onChangeText={(val) => handleChange("color", val)}
						/>
					</TextField>
				</View>

				<TextField>
					<Label>Passenger Capacity</Label>
					<Input
						placeholder="e.g. 4"
						keyboardType="numeric"
						variant="secondary"
						value={formData.capacity}
						onChangeText={(val) => handleChange("capacity", val)}
					/>
				</TextField>
			</Card.Body>
			<Card.Footer className="px-6 pb-6 pt-4 flex flex-col items-center">
				<Button
					variant="primary"
					className="w-full"
					isDisabled={isLoading}
					onPress={handleSubmit}
				>
					<Button.Label>{isLoading ? 'Registering...' : 'Register Vehicle'}</Button.Label>
				</Button>
				<View className="flex flex-row items-center gap-2 mt-4 text-default-500">
					<Feather name="shield" size={16} color="#71717a" />
					<Text className="text-xs text-default-500">Your vehicle details will be verified by administration</Text>
				</View>
			</Card.Footer>
		</Card>
	);
};
