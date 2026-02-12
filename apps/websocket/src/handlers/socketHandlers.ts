import { Server, Socket } from "socket.io";
import { redis } from "../utils/redis";
import { CHANNELS, EVENTS, logger } from "@taxiciti/utils";
import { locationQueue } from "../queues/locationQueue";

export const setupSocket = (io: Server, socket: Socket) => {
	const userId = socket.data.userId;
	const role = socket.data.role;

	logger.info(`User ${userId} (${role}) connected`);

	// Join user-specific room
	socket.join(CHANNELS.USER(userId));

	// Join role-based room
	if (role) {
		socket.join(role);
	}

	// Dynamic Channel Subscription (Pusher replacement)
	socket.on("subscribe", (channel: string) => {
		socket.join(channel);
		logger.info(`User ${userId} joined ${channel}`);
	});

	socket.on("unsubscribe", (channel: string) => {
		socket.leave(channel);
		logger.info(`User ${userId} left ${channel}`);
	});

	// Handle ride request (from user to drivers)
	socket.on(EVENTS.RIDE_REQUEST, (data: { pickup: string; destination: string; userId: string; routeId?: string }) => {
		if (data.routeId) {
			// Broadcast to drivers on specific route
			io.to(CHANNELS.ROUTE(data.routeId)).emit(EVENTS.NEW_RIDE_REQUEST, {
				...data,
				requestId: `req-${Date.now()}`,
				timestamp: new Date().toISOString(),
			});
			logger.info(`Ride request from ${data.userId} broadcasted to route ${data.routeId}`);
		} else {
			// Fallback: Broadcast to all drivers if no route specified
			io.to(CHANNELS.DRIVER).emit(EVENTS.NEW_RIDE_REQUEST, {
				...data,
				requestId: `req-${Date.now()}`,
				timestamp: new Date().toISOString(),
			});
			logger.info(`Ride request from ${data.userId} broadcasted to all drivers`);
		}
	});

	// Handle driver acceptance
	socket.on(EVENTS.RIDE_ACCEPTED, (data: { requestId: string; driverId: string; userId: string }) => {
		// Notify the user
		io.to(CHANNELS.USER(data.userId)).emit(EVENTS.RIDE_ACCEPTED, data);
		// Notify other drivers that ride is taken
		socket.to(CHANNELS.DRIVER).emit(EVENTS.RIDE_TAKEN, { requestId: data.requestId });
		logger.info(`Ride ${data.requestId} accepted by ${data.driverId}`);
	});

	// Handle ride status updates
	socket.on(EVENTS.RIDE_STATUS_UPDATE, (data: { rideId: string; status: string; userId: string; driverId?: string }) => {
		io.to(CHANNELS.USER(data.userId)).emit(EVENTS.RIDE_STATUS_CHANGED, data);
		if (data.driverId) {
			io.to(CHANNELS.USER(data.driverId)).emit(EVENTS.RIDE_STATUS_CHANGED, data);
		}
		logger.info(`Ride ${data.rideId} status update: ${data.status}`);
	});

	// Handle chat messages
	socket.on(EVENTS.SEND_MESSAGE, (data: { rideId: string; message: string; senderId: string; receiverId: string }) => {
		io.to(CHANNELS.USER(data.receiverId)).emit(EVENTS.NEW_MESSAGE, data);
	});

	// Handle driver location updates
	// data payload must include taxiId, lat, lng, heading, speed
	socket.on(EVENTS.DRIVER_LOCATION, async (data: { driverId?: string; taxiId: string; lat: number; lng: number; heading?: number; speed?: number }) => {
		try {
			// Validate payload
			if (!data.taxiId || !data.lat || !data.lng) {
				return; // Invalid payload
			}

			// Security Check: Verify driver is authorized for this taxi
			const activeTaxiId = await redis.get(`driver:${userId}:active_taxi`);

			if (activeTaxiId !== data.taxiId) {
				logger.warn(`Unauthorized location update: User ${userId} tried to update taxi ${data.taxiId} but active session is ${activeTaxiId}`);
				return;
			}

			const locationData = {
				driverId: userId, // Ensure we use authenticated userId
				taxiId: data.taxiId,
				lat: data.lat,
				lng: data.lng,
				heading: data.heading || 0,
				speed: data.speed || 0,
				timestamp: Date.now(),
			};

			// 1. Cache in Redis (Hot Storage) - 60s TTL
			await redis.set(`vehicle:${data.taxiId}:location`, JSON.stringify(locationData), "EX", 60);

			// 2. Broadcast to vehicle-specific channel
			io.to(CHANNELS.VEHICLE(data.taxiId)).emit(EVENTS.LOCATION_UPDATE, locationData);

			// 3. Queue for Bulk Persistence
			locationQueue.add("persist-location", locationData, {
				removeOnComplete: true,
				removeOnFail: 100,
			});
		} catch (err) {
			logger.error(err, `Error handling driver-location for user ${userId}`);
		}
	});

	// Handle disconnection
	socket.on("disconnect", () => {
		logger.info(`User ${userId} disconnected`);
	});
};
