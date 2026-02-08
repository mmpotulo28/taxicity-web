import "newrelic";
import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import cors from "cors";
import helmet from "helmet";
import { clerkMiddleware, createClerkClient } from "@clerk/express";
import { config } from "./config/env";
import { logger } from "./utils/logger";
import { socketAuthMiddleware } from "./middleware/auth";
import { setupSocket } from "./handlers/socketHandlers";
import { createApiRouter } from "./routes/api";

const startServer = () => {
	const app = express();
	const server = createServer(app);
	const clerkClient = createClerkClient({ publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!, secretKey: process.env.CLERK_SECRET_KEY });

	// Security & Middleware
	app.use(helmet());
	app.use(cors());
	app.use(express.json());
	app.use(clerkMiddleware({ clerkClient }));

	// Redis Adapter Setup
	const pubClient = new Redis(config.redisUrl);
	const subClient = pubClient.duplicate();

	pubClient.on("error", (err) => logger.error(err, "Redis Pub Client Error"));
	subClient.on("error", (err) => logger.error(err, "Redis Sub Client Error"));

	// Socket.IO Setup
	const io = new Server(server, {
		cors: {
			origin: config.corsOrigin,
			methods: ["GET", "POST"],
		},
		adapter: createAdapter(pubClient, subClient),
	});

	// Socket Authentication Middleware
	io.use(socketAuthMiddleware);

	// Socket Event Handlers
	io.on("connection", (socket) => setupSocket(io, socket));

	// API Routes
	app.use("/", createApiRouter(io));

	// Start Server
	server.listen(config.port, () => {
		logger.info(`WebSocket server running on port ${config.port} in ${config.nodeEnv} mode`);
	});
};

startServer();
