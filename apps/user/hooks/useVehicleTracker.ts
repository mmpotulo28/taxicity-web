import { useEffect, useState } from "react";
import { usePusher } from "@taxiciti/ui";

interface VehicleLocation {
	lat: number;
	lng: number;
	heading: number;
	speed: number;
	timestamp: number;
}

export const useVehicleTracker = (vehicleId: string | null) => {
	const { subscribe, unsubscribe } = usePusher();
	const [location, setLocation] = useState<VehicleLocation | null>(null);

	useEffect(() => {
		if (!vehicleId) return;

		const channelName = `vehicle-${vehicleId}`;

		// Subscribe to specific event on the channel
		subscribe<VehicleLocation>(channelName, "location-update", (data) => {
			setLocation(data);
		});

		return () => {
			unsubscribe(channelName);
		};
	}, [vehicleId, subscribe, unsubscribe]);

	return { location };
};
