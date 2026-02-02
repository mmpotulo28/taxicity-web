"use client";
import React, { createContext, useContext, useState, useRef, useCallback, useMemo } from "react";

export interface LatLng {
	lat: number;
	lng: number;
}

// Mocking the Google Maps event interface that MapView is asserting
interface MapMouseEvent {
	latLng: {
		lat: () => number;
		lng: () => number;
	} | null;
}

type MapContextType = {
	mapRef: React.RefObject<any>;
	isMapLoaded: boolean;
	selectedLocation: LatLng | null;
	selectionMode: "pickup" | "dropoff" | null;
	userLocation: LatLng | null;
	pickupMarker: LatLng | null;
	dropoffMarker: LatLng | null;

	// Actions
	setIsMapLoaded: (loaded: boolean) => void;
	setSelectedLocation: (location: LatLng | null) => void;
	setSelectionMode: (mode: "pickup" | "dropoff" | null) => void;
	setUserLocation: (location: LatLng | null) => void;
	setPickupMarker: (location: LatLng | null) => void;
	setDropoffMarker: (location: LatLng | null) => void;
	handleMapClick: (e: MapMouseEvent) => void;
	getAddressFromLatLng: (latLng: LatLng) => Promise<string>;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: Readonly<{ children: React.ReactNode }>) {
	const mapRef = useRef<any>(null);
	const [isMapLoaded, setIsMapLoaded] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
	const [selectionMode, setSelectionMode] = useState<"pickup" | "dropoff" | null>(null);
	const [userLocation, setUserLocation] = useState<LatLng | null>(null);
	const [pickupMarker, setPickupMarker] = useState<LatLng | null>(null);
	const [dropoffMarker, setDropoffMarker] = useState<LatLng | null>(null);

	// Handle map clicks based on selection mode
	const handleMapClick = useCallback((e: MapMouseEvent) => {
		if (!e.latLng || !selectionMode) return;

		console.log("Map clicked in mode:", selectionMode);

		const clickedLocation = {
			lat: e.latLng.lat(),
			lng: e.latLng.lng(),
		};

		setSelectedLocation(clickedLocation);

		if (selectionMode === "pickup") {
			console.log("Setting pickup marker to:", clickedLocation);
			setPickupMarker(clickedLocation);
		} else if (selectionMode === "dropoff") {
			console.log("Setting dropoff marker to:", clickedLocation);
			setDropoffMarker(clickedLocation);
		}
	}, [selectionMode]);

	// Reverse geocoding using Mapbox API
	const getAddressFromLatLng = useCallback(async (latLng: LatLng): Promise<string> => {
		const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
		if (!token) {
			console.warn("Mapbox token missing for geocoding");
			return "Location selected";
		}

		try {
			const response = await fetch(
				`https://api.mapbox.com/geocoding/v5/mapbox.places/${latLng.lng},${latLng.lat}.json?access_token=${token}&types=address,poi`
			);

			if (!response.ok) {
				throw new Error(`Geocoding failed: ${response.statusText}`);
			}

			const data = await response.json();
			if (data.features && data.features.length > 0) {
				// Prefer the place_name which is the full address
				return data.features[0].place_name;
			}
		} catch (error) {
			console.error("Error getting address:", error);
		}

		return "Selected location";
	}, []);

	const value = useMemo(() => ({
		mapRef,
		isMapLoaded,
		selectedLocation,
		selectionMode,
		userLocation,
		pickupMarker,
		dropoffMarker,

		setIsMapLoaded,
		setSelectedLocation,
		setSelectionMode,
		setUserLocation,
		setPickupMarker,
		setDropoffMarker,
		handleMapClick,
		getAddressFromLatLng,
	}), [
		isMapLoaded,
		selectedLocation,
		selectionMode,
		userLocation,
		pickupMarker,
		dropoffMarker,
		handleMapClick,
		getAddressFromLatLng
	]);

	return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMap() {
	const context = useContext(MapContext);

	if (context === undefined) {
		throw new Error("useMap must be used within a MapProvider");
	}

	return context;
}
