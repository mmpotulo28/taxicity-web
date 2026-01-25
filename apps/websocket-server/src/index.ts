import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { clerkMiddleware, getAuth, requireAuth } from "@clerk/express";

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.NODE_ENV === "production" ? ["https://taxyciti.mpotulo.com", "https://taxyciti-driver.mpotulo.com"] : ["http://localhost:3000", "http://localhost:3001"],
		methods: ["GET", "POST"],
	},
});

// Clerk JWKS client for token verification
const client = jwksClient({
	jwksUri: `https://${process.env.CLERK_PUBLISHABLE_KEY?.split("_")[2]}.clerk.accounts.dev/.well-known/jwks.json`,
});

// Function to get signing key
function getKey(header: any, callback: any) {
	client.getSigningKey(header.kid, (err, key) => {
		if (err) {
			callback(err);
		} else {
			const signingKey = key?.getPublicKey();
			callback(null, signingKey);
		}
	});
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Health check (protected route)
app.get("/health", requireAuth(), (req, res) => {
	const { userId } = getAuth(req);
	res.json({ status: "ok", timestamp: new Date().toISOString(), userId });
});

// Socket.IO authentication middleware
io.use(async (socket: Socket, next) => {
	const token = socket.handshake.auth.token;
	if (!token) {
		return next(new Error("Authentication error: No token provided"));
	}

	try {
		// Verify JWT token using Clerk's JWKS
		jwt.verify(
			token,
			getKey,
			{
				issuer: `https://${process.env.CLERK_PUBLISHABLE_KEY?.split("_")[2]}.clerk.accounts.dev`,
			},
			(err: any, decoded: any) => {
				if (err) {
					return next(new Error("Authentication error: Invalid token"));
				}

				socket.data.userId = decoded.sub;
				socket.data.role = decoded.role || "user";
				next();
			},
		);
	} catch (err: any) {
		console.error("Socket authentication error:", err);
		next(new Error("Authentication error"));
	}
});

// Socket.IO connection handling
io.on("connection", (socket: Socket) => {
	console.log(`User ${socket.data.userId} connected`);

	// Join user-specific room
	socket.join(`user-${socket.data.userId}`);

	// Join role-based room
	socket.join(socket.data.role);

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

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
	console.log(`WebSocket server running on port ${PORT}`);
});
