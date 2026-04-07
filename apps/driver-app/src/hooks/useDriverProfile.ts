import { useAuth } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { apiGet, apiPatch } from "../lib/api-client";

export interface DriverProfileData {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string | null;
	address: string | null;
	licenseNumber: string | null;
}

export interface DriverProfileForm {
	phoneNumber: string;
	address: string;
	licenseNumber: string;
}

export function useDriverProfile() {
	const { signOut } = useAuth();
	const [profile, setProfile] = useState<DriverProfileData | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [formData, setFormData] = useState<DriverProfileForm>({
		phoneNumber: "",
		address: "",
		licenseNumber: "",
	});

	const fetchProfile = useCallback(async () => {
		try {
			const data = await apiGet<DriverProfileData>("/api/driver/me");
			setProfile(data);
			setFormData({
				phoneNumber: data.phoneNumber ?? "",
				address: data.address ?? "",
				licenseNumber: data.licenseNumber ?? "",
			});
		} catch {
			Alert.alert("Error", "Failed to load profile");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchProfile();
	}, [fetchProfile]);

	const setProfileField = useCallback(<K extends keyof DriverProfileForm>(key: K, value: DriverProfileForm[K]) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	}, []);

	const saveChanges = useCallback(async () => {
		try {
			setSaving(true);
			await apiPatch("/api/driver/me", { ...formData });
			Alert.alert("Success", "Profile updated successfully");
		} catch {
			Alert.alert("Error", "Failed to update profile");
		} finally {
			setSaving(false);
		}
	}, [formData]);

	const switchMode = useCallback(async () => {
		const userAppUrl = process.env.EXPO_PUBLIC_USER_APP_URL;
		if (!userAppUrl) {
			Alert.alert("User App URL Missing", "Set EXPO_PUBLIC_USER_APP_URL to enable switching to user mode.");
			return;
		}
		await WebBrowser.openBrowserAsync(userAppUrl);
	}, []);

	const signOutDriver = useCallback(async () => {
		try {
			await signOut();
		} catch {
			Alert.alert("Error", "Failed to sign out");
		}
	}, [signOut]);

	return {
		profile,
		loading,
		saving,
		formData,
		setProfileField,
		saveChanges,
		switchMode,
		signOutDriver,
	};
}
