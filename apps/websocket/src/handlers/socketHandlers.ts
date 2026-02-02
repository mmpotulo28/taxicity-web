import { Server, Socket } from "socket.io";
import { logger } from "../utils/logger";

export const setupSocket = (io: Server, socket: Socket) => {
	const userId = socket.data.userId;
	const role = socket.data.role;

	logger.info(`User ${userId} (${role}) connected`);

	// Join user-specific room
	socket.join(`user-${userId}`);

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
	socket.on("ride-request", (data: { pickup: string; destination: string; userId: string }) => {
		// Broadcast to all drivers
		io.to("driver").emit("new-ride-request", {
			...data,
			requestId: `req-${Date.now()}`,
			timestamp: new Date().toISOString(),
		});
		logger.info(`Ride request from ${data.userId} broadcasted to drivers`);
	});

	// Handle driver acceptance
	socket.on("accept-ride", (data: { requestId: string; driverId: string; userId: string }) => {
		// Notify the user
		io.to(`user-${data.userId}`).emit("ride-accepted", data);
		// Notify other drivers that ride is taken
		socket.to("driver").emit("ride-taken", { requestId: data.requestId });
		logger.info(`Ride ${data.requestId} accepted by ${data.driverId}`);
	});

	// Handle driver location updates
	socket.on("driver-location", (data: { driverId: string; lat: number; lng: number }) => {
		// Broadcast to users who have active rides with this driver
		// For simplicity, broadcast to all users (in production, filter by active rides)
		io.to("user").emit("driver-location-update", data);
	});

	// Handle ride status updates
	socket.on("ride-status-update", (data: { rideId: string; status: string; userId: string; driverId?: string }) => {
		io.to(`user-${data.userId}`).emit("ride-status-changed", data);
		if (data.driverId) {
			io.to(`user-${data.driverId}`).emit("ride-status-changed", data);
		}
		logger.info(`Ride ${data.rideId} status update: ${data.status}`);
	});

	// Handle chat messages
	socket.on("send-message", (data: { rideId: string; message: string; senderId: string; receiverId: string }) => {
		io.to(`user-${data.receiverId}`).emit("new-message", data);
	});

	// Handle disconnection
	socket.on("disconnect", () => {
		logger.info(`User ${userId} disconnected`);
	});
};
