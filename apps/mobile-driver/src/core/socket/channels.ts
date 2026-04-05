export const socketChannels = {
  route: (routeId: string) => `route-${routeId}`,
  user: (userId: string) => `user-${userId}`,
  notificationsGlobal: "notifications-global"
} as const;

export const socketEvents = {
  requestsSync: "driver-requests-sync",
  newRideRequest: "new-ride-request",
  rideAccepted: "ride-accepted",
  rideTaken: "ride-taken",
  rideStatusUpdate: "ride-status-update",
  rideStatusChanged: "ride-status-changed",
  driverLocation: "driver-location"
} as const;
