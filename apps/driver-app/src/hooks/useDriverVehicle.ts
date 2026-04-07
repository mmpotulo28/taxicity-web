import * as DocumentPicker from "expo-document-picker";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiRequest } from "../lib/api-client";

interface TaxiRoute {
	id: string;
	route: {
		id: string;
		name: string;
	};
	isActive: boolean;
}

export interface DriverTaxiVehicle {
	id: string;
	licensePlate: string;
	make: string;
	model: string;
	year: number;
	color: string;
	capacity: number;
	status: string;
	registrationDoc?: string;
	insuranceDoc?: string;
	permitDoc?: string;
	routes?: TaxiRoute[];
}

interface DriverPayload {
	id: string;
	taxis: DriverTaxiVehicle[];
}

export interface DriverVehicleRoute {
	id: string;
	name: string;
}

interface DriverVehicleFormData {
	plateNumber: string;
	make: string;
	model: string;
	color: string;
	seats: string;
}

const initialFormData: DriverVehicleFormData = {
	plateNumber: "",
	make: "",
	model: "",
	color: "",
	seats: "15",
};

export function useDriverVehicle() {
	const [loading, setLoading] = useState(true);
	const [taxis, setTaxis] = useState<DriverTaxiVehicle[]>([]);
	const [showRegistration, setShowRegistration] = useState(false);
	const [registeringVehicle, setRegisteringVehicle] = useState(false);
	const [selectedTaxi, setSelectedTaxi] = useState<DriverTaxiVehicle | null>(null);
	const [routes, setRoutes] = useState<DriverVehicleRoute[]>([]);
	const [selectedRouteId, setSelectedRouteId] = useState("");
	const [permitFile, setPermitFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
	const [updatingRoute, setUpdatingRoute] = useState(false);
	const [formData, setFormData] = useState<DriverVehicleFormData>(initialFormData);

	const hasVehicles = useMemo(() => taxis.length > 0, [taxis]);

	const fetchDriverVehicles = useCallback(async () => {
		try {
			const driver = await apiGet<DriverPayload>("/api/driver/me");
			setTaxis(driver.taxis ?? []);
		} catch {
			setTaxis([]);
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchRoutes = useCallback(async () => {
		try {
			const data = await apiGet<{ routes?: DriverVehicleRoute[] }>("/api/driver/routes");
			setRoutes(data.routes ?? []);
		} catch {
			setRoutes([]);
		}
	}, []);

	useEffect(() => {
		void fetchDriverVehicles();
	}, [fetchDriverVehicles]);

	useEffect(() => {
		if (selectedTaxi) {
			setSelectedRouteId(selectedTaxi.routes?.find((route) => route.isActive)?.route.id ?? "");
			void fetchRoutes();
		}
	}, [fetchRoutes, selectedTaxi]);

	const setFormField = useCallback(<K extends keyof DriverVehicleFormData>(key: K, value: DriverVehicleFormData[K]) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	}, []);

	const closeRegistration = useCallback(() => {
		setShowRegistration(false);
	}, []);

	const openRegistration = useCallback(() => {
		setShowRegistration(true);
	}, []);

	const handleRegisterVehicle = useCallback(async () => {
		try {
			setRegisteringVehicle(true);
			const payload: Record<string, unknown> = { ...formData };
			await apiPost("/api/driver/vehicle", payload);
			setShowRegistration(false);
			setFormData(initialFormData);
			await fetchDriverVehicles();
		} finally {
			setRegisteringVehicle(false);
		}
	}, [fetchDriverVehicles, formData]);

	const closeRouteModal = useCallback(() => {
		setSelectedTaxi(null);
		setPermitFile(null);
	}, []);

	const pickPermitFile = useCallback(async () => {
		const result = await DocumentPicker.getDocumentAsync({
			type: ["application/pdf", "image/*"],
			copyToCacheDirectory: true,
		});

		if (!result.canceled) {
			setPermitFile(result.assets[0]);
		}
	}, []);

	const handleUpdateRoute = useCallback(async () => {
		if (!selectedTaxi || !selectedRouteId || !permitFile) {
			return;
		}

		try {
			setUpdatingRoute(true);
			const fileResponse = await fetch(permitFile.uri);
			const fileBlob = await fileResponse.blob();
			const permitFilename = permitFile.name ?? `permit-${Date.now()}.pdf`;
			const uploadResult = await apiRequest<{ url: string }>(`/api/upload?filename=${encodeURIComponent(permitFilename)}`, {
				method: "POST",
				body: fileBlob,
			});

			await apiPost(`/api/driver/vehicle/${selectedTaxi.id}/route`, {
				routeId: selectedRouteId,
				permitDoc: uploadResult.url,
			});
			setSelectedTaxi(null);
			setPermitFile(null);
			await fetchDriverVehicles();
		} finally {
			setUpdatingRoute(false);
		}
	}, [fetchDriverVehicles, permitFile, selectedRouteId, selectedTaxi]);

	return {
		loading,
		taxis,
		hasVehicles,
		showRegistration,
		openRegistration,
		closeRegistration,
		registeringVehicle,
		selectedTaxi,
		setSelectedTaxi,
		routes,
		selectedRouteId,
		setSelectedRouteId,
		permitFile,
		pickPermitFile,
		updatingRoute,
		formData,
		setFormField,
		handleRegisterVehicle,
		handleUpdateRoute,
		closeRouteModal,
		refreshVehicles: fetchDriverVehicles,
	};
}
