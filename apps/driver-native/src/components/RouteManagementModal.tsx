
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "heroui-native/modal";
import { Button } from "heroui-native/button";
import { Select, SelectItem } from "heroui-native/select";
import { Feather } from "@expo/vector-icons";
import { addToast } from "heroui-native/toast";
import { apiGet, apiPost, apiRequest } from "@/lib/api-client";

interface Route {
	id: string;
	name: string;
}

interface RouteManagementModalProps {
	isOpen: boolean;
	onClose: () => void;
	taxiId: string;
	currentRouteId?: string;
	onSuccess: () => void;
}

export const RouteManagementModal: React.FC<RouteManagementModalProps> = ({ isOpen, onClose, taxiId, currentRouteId, onSuccess }) => {
	const [routes, setRoutes] = useState<Route[]>([]);
	const [selectedRoute, setSelectedRoute] = useState<string>(currentRouteId || "");
	const [permitFile, setPermitFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);

	useEffect(() => {
		const fetchRoutes = async () => {
			try {
				const data = await apiGet<{ routes?: Route[] }>("/api/driver/routes");
				setRoutes(data.routes || []);
			} catch (err) {
				console.error("Failed to fetch routes", err);
			}
		};

		fetchRoutes();
	}, []);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			setPermitFile(e.target.files[0]);
		}
	};

	const handleSubmit = async () => {
		if (!selectedRoute || !permitFile) return;

		setLoading(true);
		try {
			// 1. Upload Permit
			setUploading(true);
			const uploadResult = await apiRequest<{ url: string }>(`/api/upload?filename=${permitFile.name}`, {
				method: "POST",
				body: permitFile,
			});
			const permitUrl = uploadResult.url;
			setUploading(false);

			// 2. Update Route
			await apiPost(`/api/driver/vehicle/${taxiId}/route`, {
				routeId: selectedRoute,
				permitDoc: permitUrl,
			});

			addToast({
				title: "Success",
				description: "Route update request submitted successfully",
				color: "success",
			});
			onSuccess();
			onClose();
		} catch (error) {
			console.error(error);
			addToast({
				title: "Error",
				description: "Failed to update route",
				color: "danger",
			});
		} finally {
			setLoading(false);
			setUploading(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalContent>
				<ModalHeader>Manage Route</ModalHeader>
				<ModalBody>
					<Text className='text-small text-default-500 mb-4'>To change your route, you must select a new route and upload a valid operating permit for that route.</Text>

					<Select label='Select Route' placeholder='Choose a route' selectedKeys={selectedRoute ? [selectedRoute] : []} onChange={(e) => setSelectedRoute(e.target.value)}>
						{routes.map((route) => (
							<SelectItem key={route.id}>{route.name}</SelectItem>
						))}
					</Select>

					<View className='mt-4'>
						<Text className='text-small font-bold mb-2'>Upload New Permit</Text>
						<View className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${permitFile ? "border-success bg-success-50" : "border-default-300 hover:bg-default-100"}`} onPress={() => document.getElementById("modalPermitDoc")?.click()}>
							{permitFile ? (
								<>
									<Feather name="check-circle" className='w-6 h-6 mx-auto mb-1 text-success' />
									<Text className='text-xs font-medium text-success-700'>{permitFile.name}</Text>
								</>
							) : (
								<>
									<Feather name="upload" className='w-6 h-6 mx-auto mb-1 text-default-500' />
									<Text className='text-xs font-medium'>Click to upload permit</Text>
								</>
							)}
							<input id='modalPermitDoc' type='file' className='hidden' accept='.pdf,image/*' onChange={handleFileChange} />
						</View>
					</View>
				</ModalBody>
				<ModalFooter>
					<Button variant='secondary' onPress={onClose}>
						Cancel
					</Button>
					<Button variant='primary' onPress={handleSubmit} isLoading={loading} isDisabled={!selectedRoute || !permitFile}>
						{uploading ? "Uploading..." : "Update Route"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
