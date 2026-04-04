"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@heroui/input";
import { Icon } from "@iconify/react";

// Extend the global namespace to include Google Maps types
declare global {
	interface Window {
		google: typeof google;
	}
}

interface PlaceResult {
	address: string;
	city: string;
	province: string;
	region: string;
	lat: number;
	lng: number;
}

interface GooglePlacesAutocompleteProps {
	readonly onPlaceSelected: (place: PlaceResult) => void;
	readonly defaultValue?: string;
	readonly label?: string;
	readonly placeholder?: string;
}

export default function GooglePlacesAutocomplete({ onPlaceSelected, defaultValue = "", label = "Search Location", placeholder = "Start typing an address..." }: GooglePlacesAutocompleteProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [value, setValue] = useState(defaultValue);

	useEffect(() => {
		// Load Google Maps script
		const loadGoogleMapsScript = () => {
			if (globalThis.google?.maps) {
				setIsLoaded(true);
				return;
			}

			const script = document.createElement("script");
			const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

			if (!apiKey) {
				console.error("Google Maps API key is missing");
				return;
			}

			script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
			script.async = true;
			script.defer = true;
			script.onload = () => setIsLoaded(true);
			document.head.appendChild(script);
		};

		loadGoogleMapsScript();
	}, []);

	useEffect(() => {
		if (!isLoaded || !inputRef.current) return;

		// Initialize Google Places Autocomplete
		const google = (globalThis as any).google; // eslint-disable-line @typescript-eslint/no-explicit-any
		if (!google?.maps?.places?.Autocomplete) return;

		autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
			componentRestrictions: { country: "za" }, // Restrict to South Africa
			fields: ["address_components", "geometry", "formatted_address", "name"],
			types: ["establishment", "geocode"], // Allow both places and addresses
		});

		const autocomplete = autocompleteRef.current;
		if (!autocomplete) return;

		// Listen for place selection
		autocomplete.addListener("place_changed", () => {
			const place = autocomplete.getPlace();

			if (!place?.geometry?.location) {
				console.error("No geometry found for the selected place");
				return;
			}

			// Extract address components
			const addressComponents = place.address_components || [];
			let streetAddress = "";
			let city = "";
			let province = "";
			let region = "";

			addressComponents.forEach((component) => {
				const types = component.types;

				if (types.includes("street_number")) {
					streetAddress = component.long_name + " " + streetAddress;
				}
				if (types.includes("route")) {
					streetAddress += component.long_name;
				}
				if (types.includes("sublocality") || types.includes("locality")) {
					city = component.long_name;
				}
				if (types.includes("administrative_area_level_1")) {
					province = component.long_name;
				}
				if (types.includes("administrative_area_level_2")) {
					region = component.long_name;
				}
			});

			// Fallback: use formatted_address if no street address found
			if (!streetAddress && place.formatted_address) {
				streetAddress = place.formatted_address;
			}

			// Fallback: use name if it's a place
			if (!streetAddress && place.name) {
				streetAddress = place.name;
			}

			const result: PlaceResult = {
				address: streetAddress.trim(),
				city: city || "",
				province: province || "",
				region: region || "",
				lat: place.geometry.location.lat(),
				lng: place.geometry.location.lng(),
			};

			setValue(place.formatted_address || place.name || "");
			onPlaceSelected(result);
		});

		// Cleanup
		return () => {
			const google = (globalThis as any).google; // eslint-disable-line @typescript-eslint/no-explicit-any
			if (autocompleteRef.current && google?.maps?.event) {
				google.maps.event.clearInstanceListeners(autocompleteRef.current);
			}
		};
	}, [isLoaded, onPlaceSelected]);

	return (
		<div className='relative'>
			<Input ref={inputRef} label={label} placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} variant='bordered' labelPlacement='outside' startContent={<Icon icon='lucide:search' className='text-default-400' />} description={isLoaded ? "Search and select a location" : "Loading Google Maps..."} isDisabled={!isLoaded} />
		</div>
	);
}
