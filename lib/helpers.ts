import { taxis } from "./data";

import { iTaxi } from "@/types";

export const getTaxiIcon = () => {
	const isWindowDefined = typeof window !== "undefined";
	const hasGoogle = isWindowDefined && window.google;
	const hasGoogleMaps = hasGoogle && window.google.maps;

	if (hasGoogleMaps) {
		return {
			url: "/images/taxi-3d-transparent.png",
			scaledSize: new window.google.maps.Size(80, 80),
		};
	}

	return undefined;
};

// Helper functions
export const getRandomTaxis = (count: number = 3): iTaxi[] => {
	// Shuffle taxis array
	const shuffled = [...taxis].sort(() => 0.5 - Math.random());

	// Get first n elements
	return shuffled.slice(0, count);
};
