import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import { clerkMiddleware, getAuth, requireAuth } from "@clerk/express";

const app = express();
app.use(clerkMiddleware());
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.NODE_ENV === "production" ? ["https://taxyciti.mpotulo.com", "https://taxyciti-driver.mpotulo.com"] : "*", // Allow all in dev for easier testing with IPs
		methods: ["GET", "POST"],
	},
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Helper for type safety
interface TriggerRequest extends express.Request {
	body: {
		channel: string;
		event: string;
		data: any;
	};
}

// Internal API Trigger Endpoint (Replaces Pusher Trigger)
app.post("/trigger", (req: express.Request, res: express.Response) => {
	const { isAuthenticated } = getAuth(req);
	if (!isAuthenticated) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	const { channel, event, data } = req.body;

	if (!channel || !event) {
		return res.status(400).json({ error: "Missing channel or event" });
	}

	// Emit the event to the channel
	io.to(channel).emit(event, data);

	console.log(`[API Trigger] Channel: ${channel}, Event: ${event}`);
	return res.json({ status: "success" });
});

// Health check (protected route)
app.get("/health", requireAuth(), (req, res) => {
	const { userId } = getAuth(req);
	res.json({ status: "ok", timestamp: new Date().toISOString(), userId });
});

// Socket.IO connection handling
io.on("connection", (socket: Socket) => {
	console.log(`User ${socket.data.userId} connected`);

	// Join user-specific room
	socket.join(`user-${socket.data.userId}`);

	// Join role-based room
	socket.join(socket.data.role);

	// Dynamic Channel Subscription (Pusher replacement)
	socket.on("subscribe", (channel: string) => {
		socket.join(channel);
		console.log(`User ${socket.data.userId} joined ${channel}`);
	});

	socket.on("unsubscribe", (channel: string) => {
		socket.leave(channel);
		console.log(`User ${socket.data.userId} left ${channel}`);
	});

	// Handle ride request (from user to drivers)
	socket.on("ride-request", (data: { pickup: string; destination: string; userId: string }) => {
		// Broadcast to all drivers
		io.to("driver").emit("new-ride-request", {
			...data,
			requestId: `req-${Date.now()}`,
			timestamp: new Date().toISOString(),
		});
	});

	// Handle driver acceptance
	socket.on("accept-ride", (data: { requestId: string; driverId: string; userId: string }) => {
		// Notify the user
		io.to(`user-${data.userId}`).emit("ride-accepted", data);
		// Notify other drivers that ride is taken
		socket.to("driver").emit("ride-taken", { requestId: data.requestId });
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
	});

	// Handle chat messages
	socket.on("send-message", (data: { rideId: string; message: string; senderId: string; receiverId: string }) => {
		io.to(`user-${data.receiverId}`).emit("new-message", data);
	});

	// Handle disconnection
	socket.on("disconnect", () => {
		console.log(`User ${socket.data.userId} disconnected`);
	});
});

const PORT = process.env.PORT || 3006;
server.listen(PORT, () => {
	console.log(`WebSocket server running on port ${PORT}`);
});
