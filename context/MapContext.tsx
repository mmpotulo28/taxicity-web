"use client";
import React, { createContext, useContext, useState, useRef } from "react";

type MapContextType = {
	mapRef: React.MutableRefObject<any>; // Changed from GoogleMapType to any
	isMapLoaded: boolean;
	selectedLocation: google.maps.LatLngLiteral | null;
	selectionMode: "pickup" | "dropoff" | null;
	userLocation: google.maps.LatLngLiteral | null;
	pickupMarker: google.maps.LatLngLiteral | null;
	dropoffMarker: google.maps.LatLngLiteral | null;

	// Actions
	setIsMapLoaded: (loaded: boolean) => void;
	setSelectedLocation: (location: google.maps.LatLngLiteral | null) => void;
	setSelectionMode: (mode: "pickup" | "dropoff" | null) => void;
	setUserLocation: (location: google.maps.LatLngLiteral | null) => void;
	setPickupMarker: (location: google.maps.LatLngLiteral | null) => void;
	setDropoffMarker: (location: google.maps.LatLngLiteral | null) => void;
	handleMapClick: (e: google.maps.MapMouseEvent) => void;
	getAddressFromLatLng: (latLng: google.maps.LatLngLiteral) => Promise<string>;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
	const mapRef = useRef<any>(null); // Changed from GoogleMapType to any
	const [isMapLoaded, setIsMapLoaded] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLngLiteral | null>(
		null,
	);
	const [selectionMode, setSelectionMode] = useState<"pickup" | "dropoff" | null>(null);
	const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
	const [pickupMarker, setPickupMarker] = useState<google.maps.LatLngLiteral | null>(null);
	const [dropoffMarker, setDropoffMarker] = useState<google.maps.LatLngLiteral | null>(null);

	// Handle map clicks based on selection mode
	const handleMapClick = (e: google.maps.MapMouseEvent) => {
		if (!e.latLng || !selectionMode) return;

		const clickedLocation = {
			lat: e.latLng.lat(),
			lng: e.latLng.lng(),
		};

		setSelectedLocation(clickedLocation);

		if (selectionMode === "pickup") {
			setPickupMarker(clickedLocation);
		} else if (selectionMode === "dropoff") {
			setDropoffMarker(clickedLocation);
		}
	};

	// Reverse geocoding to get address from coordinates
	const getAddressFromLatLng = async (latLng: google.maps.LatLngLiteral): Promise<string> => {
		if (typeof window === "undefined" || !window.google) {
			return "Location selected";
		}

		try {
			const geocoder = new google.maps.Geocoder();
			const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
				geocoder.geocode({ location: latLng }, (results, status) => {
					if (status === "OK" && results && results.length > 0) {
						resolve(results);
					} else {
						reject(status);
					}
				});
			});

			if (response[0]) {
				return response[0].formatted_address;
			}
		} catch (error) {
			console.error("Error getting address:", error);
		}

		return "Selected location";
	};

	const value = {
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
	};

	return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMap() {
	const context = useContext(MapContext);

	if (context === undefined) {
		throw new Error("useMap must be used within a MapProvider");
	}

	return context;
}
