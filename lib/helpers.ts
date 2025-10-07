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
