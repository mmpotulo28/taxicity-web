import { EVENTS } from "@taxiciti/utils";

export const socketEvents = {
  requestsSync: EVENTS.DRIVER_REQUESTS_SYNC,
  newRideRequest: EVENTS.NEW_RIDE_REQUEST,
  rideAccepted: EVENTS.RIDE_ACCEPTED,
  rideDeclined: EVENTS.RIDE_DECLINED,
  rideTaken: EVENTS.RIDE_TAKEN,
  rideStatusUpdate: EVENTS.RIDE_STATUS_UPDATE,
  rideStatusChanged: EVENTS.RIDE_STATUS_CHANGED,
  driverLocation: EVENTS.DRIVER_LOCATION
} as const;
