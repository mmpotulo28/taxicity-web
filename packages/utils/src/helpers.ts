export const getTaxiIcon = () => {
	const isWindowDefined = typeof window !== "undefined";
	const hasGoogle = isWindowDefined && (window as any).google;
	const hasGoogleMaps = hasGoogle && (window as any).google.maps;

	if (hasGoogleMaps) {
		return {
			url: "/images/taxi-3d-transparent.png",
			scaledSize: new (window as any).google.maps.Size(80, 80),
		};
	}

	return undefined;
};
