"use client";

import React, { useState, useEffect } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/toast";

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

export const RouteManagementModal: React.FC<RouteManagementModalProps> = ({
	isOpen,
	onClose,
	taxiId,
	currentRouteId,
	onSuccess,
}) => {
	const [routes, setRoutes] = useState<Route[]>([]);
	const [selectedRoute, setSelectedRoute] = useState<string>(currentRouteId || "");
	const [permitFile, setPermitFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);

	useEffect(() => {
		fetch("/api/routes")
			.then((res) => res.json())
			.then((data) => setRoutes(data.routes || []))
			.catch((err) => console.error("Failed to fetch routes", err));
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
			const uploadRes = await fetch(
				`/api/upload?filename=${permitFile.name}`,
				{
					method: "POST",
					body: permitFile,
				}
			);

			if (!uploadRes.ok) throw new Error("Failed to upload permit");
			const { url: permitUrl } = await uploadRes.json();
			setUploading(false);

			// 2. Update Route
			const res = await fetch(`/api/driver/vehicle/${taxiId}/route`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					routeId: selectedRoute,
					permitDoc: permitUrl,
				}),
			});

			if (!res.ok) throw new Error("Failed to update route");

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
					<p className="text-small text-default-500 mb-4">
						To change your route, you must select a new route and upload a valid
						operating permit for that route.
					</p>

					<Select
						label="Select Route"
						placeholder="Choose a route"
						selectedKeys={selectedRoute ? [selectedRoute] : []}
						onChange={(e) => setSelectedRoute(e.target.value)}
					>
						{routes.map((route) => (
							<SelectItem key={route.id}>
								{route.name}
							</SelectItem>
						))}
					</Select>

					<div className="mt-4">
						<p className="text-small font-bold mb-2">Upload New Permit</p>
						<div
							className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${permitFile
									? "border-success bg-success-50"
									: "border-default-300 hover:bg-default-100"
								}`}
							onClick={() => document.getElementById("modalPermitDoc")?.click()}
						>
							{permitFile ? (
								<>
									<Icon
										icon="lucide:check-circle"
										className="w-6 h-6 mx-auto mb-1 text-success"
									/>
									<p className="text-xs font-medium text-success-700">
										{permitFile.name}
									</p>
								</>
							) : (
								<>
									<Icon
										icon="lucide:upload"
										className="w-6 h-6 mx-auto mb-1 text-default-500"
									/>
									<p className="text-xs font-medium">Click to upload permit</p>
								</>
							)}
							<input
								id="modalPermitDoc"
								type="file"
								className="hidden"
								accept=".pdf,image/*"
								onChange={handleFileChange}
							/>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button variant="flat" onPress={onClose}>
						Cancel
					</Button>
					<Button
						color="primary"
						onPress={handleSubmit}
						isLoading={loading}
						isDisabled={!selectedRoute || !permitFile}
					>
						{uploading ? "Uploading..." : "Update Route"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
