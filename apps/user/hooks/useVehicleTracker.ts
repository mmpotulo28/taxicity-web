import { useEffect, useState } from "react";
import { usePusher } from "@taxiciti/ui";
import { CHANNELS, EVENTS } from "@taxiciti/utils";

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

		const channelName = CHANNELS.VEHICLE(vehicleId);

		// Subscribe to specific event on the channel
		const cleanup = subscribe(channelName, EVENTS.LOCATION_UPDATE, (data: VehicleLocation) => {
			setLocation(data);
		});

		return () => {
			cleanup();
			unsubscribe(channelName);
		};
	}, [vehicleId, subscribe, unsubscribe]);

	return { location };
};
