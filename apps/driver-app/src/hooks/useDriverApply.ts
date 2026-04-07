import * as DocumentPicker from "expo-document-picker";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiRequest } from "../lib/api-client";

export interface DriverRouteOption {
	id: string;
	name: string;
}

interface RouteResponse {
	routes?: DriverRouteOption[];
	pagination?: { pages?: number };
}

export interface DriverApplicationForm {
	licenseNumber: string;
	licenseExpiry: string;
	plateNumber: string;
	make: string;
	model: string;
	year: string;
	color: string;
	capacity: string;
	routeId: string;
	licenseImageFront: string;
	licenseImageBack: string;
	registrationDoc: string;
	insuranceDoc: string;
	permitDoc: string;
}

export type UploadField = "licenseImageFront" | "licenseImageBack" | "registrationDoc" | "insuranceDoc" | "permitDoc";

const initialForm: DriverApplicationForm = {
	licenseNumber: "",
	licenseExpiry: "",
	plateNumber: "",
	make: "",
	model: "",
	year: "",
	color: "",
	capacity: "15",
	routeId: "",
	licenseImageFront: "",
	licenseImageBack: "",
	registrationDoc: "",
	insuranceDoc: "",
	permitDoc: "",
};

async function uploadDocumentFromPicker() {
	const picked = await DocumentPicker.getDocumentAsync({
		type: ["application/pdf", "image/*"],
		copyToCacheDirectory: true,
	});

	if (picked.canceled) {
		return null;
	}

	const file = picked.assets[0];
	const response = await fetch(file.uri);
	const blob = await response.blob();
	const filename = file.name ?? `doc-${Date.now()}`;
	const upload = await apiRequest<{ url: string }>(`/api/upload?filename=${encodeURIComponent(filename)}`, {
		method: "POST",
		body: blob,
	});

	return upload.url;
}

function getUploadLabel(field: UploadField, value: string, uploadingField: UploadField | null) {
	if (value) {
		if (field === "licenseImageFront") return "Front uploaded";
		if (field === "licenseImageBack") return "Back uploaded";
		if (field === "registrationDoc") return "Registration uploaded";
		if (field === "insuranceDoc") return "Insurance uploaded";
		return "Permit uploaded";
	}

	if (uploadingField === field) {
		return "Uploading...";
	}

	if (field === "licenseImageFront") return "Upload license front";
	if (field === "licenseImageBack") return "Upload license back";
	if (field === "registrationDoc") return "Upload registration document";
	if (field === "insuranceDoc") return "Upload insurance document";
	return "Upload operating permit";
}

export function useDriverApply(options?: Readonly<{ onSubmitted?: () => void }>) {
	const [step, setStep] = useState(1);
	const [submitting, setSubmitting] = useState(false);
	const [loadingRoutes, setLoadingRoutes] = useState(true);
	const [routesError, setRoutesError] = useState<string | null>(null);
	const [routes, setRoutes] = useState<DriverRouteOption[]>([]);
	const [routeSearch, setRouteSearch] = useState("");
	const [uploadingField, setUploadingField] = useState<UploadField | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [form, setForm] = useState<DriverApplicationForm>(initialForm);

	const filteredRoutes = useMemo(() => {
		const query = routeSearch.trim().toLowerCase();
		if (!query) {
			return routes;
		}
		return routes.filter((route) => route.name.toLowerCase().includes(query));
	}, [routeSearch, routes]);

	const canContinueStep1 = Boolean(form.licenseNumber && form.licenseExpiry && form.licenseImageFront && form.licenseImageBack);
	const canContinueStep2 = Boolean(form.plateNumber && form.make && form.model && form.year && form.color && form.capacity);
	const canContinueStep3 = Boolean(form.routeId);
	const canSubmit = Boolean(form.registrationDoc && form.insuranceDoc && form.permitDoc);

	const fetchRoutes = useCallback(async () => {
		setLoadingRoutes(true);
		setRoutesError(null);
		setError(null);

		try {
			const limit = 200;
			let page = 1;
			let totalPages = 1;
			const allRoutes: DriverRouteOption[] = [];

			do {
				const data = await apiGet<RouteResponse>(`/api/user/routes?page=${page}&limit=${limit}`);
				allRoutes.push(...(data.routes ?? []));
				totalPages = data.pagination?.pages ?? 1;
				page += 1;
			} while (page <= totalPages);

			const deduped = Array.from(new Map(allRoutes.map((route) => [route.id, route])).values());
			setRoutes(deduped);
		} catch {
			setRoutesError("Failed to load routes. Pull to refresh and try again.");
		} finally {
			setLoadingRoutes(false);
		}
	}, []);

	useEffect(() => {
		void fetchRoutes();
	}, [fetchRoutes]);

	const setField = useCallback(<K extends keyof DriverApplicationForm>(key: K, value: DriverApplicationForm[K]) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	}, []);

	const uploadForField = useCallback(
		async (field: UploadField) => {
			setUploadingField(field);
			setError(null);

			try {
				const url = await uploadDocumentFromPicker();
				if (!url) {
					return;
				}
				setField(field, url);
			} catch {
				setError("Could not upload document. Please try again.");
			} finally {
				setUploadingField(null);
			}
		},
		[setField],
	);

	const submitApplication = useCallback(async () => {
		if (!canSubmit) {
			return;
		}

		setSubmitting(true);
		setError(null);
		try {
			const payload: Record<string, unknown> = { ...form };
			await apiPost("/api/driver/apply", payload);
			options?.onSubmitted?.();
		} catch {
			setError("Could not submit application. Please try again.");
		} finally {
			setSubmitting(false);
		}
	}, [canSubmit, form, options]);

	const getFieldUploadLabel = useCallback((field: UploadField) => getUploadLabel(field, form[field], uploadingField), [form, uploadingField]);

	return {
		step,
		setStep,
		form,
		setField,
		submitting,
		loadingRoutes,
		routesError,
		routes,
		routeSearch,
		setRouteSearch,
		uploadingField,
		error,
		filteredRoutes,
		canContinueStep1,
		canContinueStep2,
		canContinueStep3,
		canSubmit,
		fetchRoutes,
		uploadForField,
		submitApplication,
		getFieldUploadLabel,
	};
}
