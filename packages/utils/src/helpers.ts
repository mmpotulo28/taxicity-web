export const getTaxiIcon = () => {
	const isWindowDefined = typeof globalThis !== "undefined";
	const hasGoogle = isWindowDefined && (globalThis as any).google;
	const hasGoogleMaps = hasGoogle && (globalThis as any).google.maps;

	if (hasGoogleMaps) {
		return {
			url: "/images/taxi-3d-transparent.png",
			scaledSize: new (globalThis as any).google.maps.Size(80, 80),
		};
	}

	return undefined;
};

export const getHost = (app: "user" | "driver") => {
	const host = app === "user" ? process.env.EXPO_PUBLIC_USER_APP_URL : process.env.EXPO_PUBLIC_DRIVER_APP_URL;
	console.log("Using host:", host);
	return host;
};
