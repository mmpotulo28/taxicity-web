import { useEffect, useState, useRef } from "react";

interface Location {
	latitude: number;
	longitude: number;
	heading: number | null;
	speed: number | null;
	timestamp: number;
}

interface UseDriverLocationReturn {
	location: Location | null;
	error: string | null;
	isTracking: boolean;
	startTracking: () => void;
	stopTracking: () => void;
}

export const useDriverLocation = (): UseDriverLocationReturn => {
	const [location, setLocation] = useState<Location | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isTracking, setIsTracking] = useState(false);
	const watchId = useRef<number | null>(null);

	const startTracking = () => {
		if (!("geolocation" in navigator)) {
			setError("Geolocation is not supported by your browser");
			return;
		}

		if (watchId.current !== null) {
			return; // Already tracking
		}

		setIsTracking(true);
		setError(null);

		const options: PositionOptions = {
			enableHighAccuracy: true,
			timeout: 10000,
			maximumAge: 0,
		};

		watchId.current = navigator.geolocation.watchPosition(
			(position) => {
				const newLocation: Location = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					heading: position.coords.heading,
					speed: position.coords.speed,
					timestamp: position.timestamp,
				};

				setLocation(newLocation);

				// TODO: In Phase 2, this will send data to the Ingestion API
				console.log("📍 Driver Location Update:", newLocation);
			},
			(err) => {
				console.error("Geolocation Error:", err);
				setError(`Error tracking location: ${err.message}`);
				setIsTracking(false);
				if (watchId.current !== null) {
					navigator.geolocation.clearWatch(watchId.current);
					watchId.current = null;
				}
			},
			options,
		);
	};

	const stopTracking = () => {
		if (watchId.current !== null) {
			navigator.geolocation.clearWatch(watchId.current);
			watchId.current = null;
		}
		setIsTracking(false);
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (watchId.current !== null) {
				navigator.geolocation.clearWatch(watchId.current);
			}
		};
	}, []);

	return { location, error, isTracking, startTracking, stopTracking };
};
