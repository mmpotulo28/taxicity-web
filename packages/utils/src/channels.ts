export const CHANNELS = {
	VEHICLE: (id: string) => `vehicle-${id}`,
	USER: (id: string) => `user-${id}`,
	DRIVER: "driver",
	USER_GLOBAL: "user",
} as const;

export const EVENTS = {
	LOCATION_UPDATE: "location-update",
	RIDE_REQUEST: "ride-request",
	NEW_RIDE_REQUEST: "new-ride-request",
	RIDE_ACCEPTED: "ride-accepted",
	RIDE_TAKEN: "ride-taken",
	RIDE_STATUS_UPDATE: "ride-status-update",
	RIDE_STATUS_CHANGED: "ride-status-changed",
	NEW_MESSAGE: "new-message",
	SEND_MESSAGE: "send-message",
	DRIVER_LOCATION: "driver-location",
} as const;
