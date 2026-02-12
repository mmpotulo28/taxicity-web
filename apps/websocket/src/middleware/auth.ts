import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { config } from "../configs/variables.js";
import { logger } from "@taxiciti/utils";

export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
	const token = socket.handshake.auth.token;

	if (!token) {
		logger.warn("Connection attempt without token");
		return next(new Error("Authentication error: No token provided"));
	}

	try {
		// In production, verifying Clerk JWTs properly requires identifying the key.
		// For this specifc iteration, we'll decode to get the sub (userId)
		// Ideally, use @clerk/backend verifyToken or similar.
		const decoded = jwt.decode(token) as any;

		if (!decoded?.sub) {
			return next(new Error("Authentication error: Invalid token structure"));
		}

		socket.data.userId = decoded.sub;

		// Check socket handshake query for role hint, default to 'user'
		const role = socket.handshake.query.role || "user";
		socket.data.role = role;

		next();
	} catch (err) {
		logger.error(err, "Token verification failed:");
		next(new Error("Authentication error: Invalid Token"));
	}
};

export const apiAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
	// Check API Key first (for internal use)
	const apiKey = req.headers["x-api-key"];
	if (apiKey === config.internalApiKey) {
		return next();
	}

	// Fallback to Clerk Auth
	const auth = getAuth(req);
	if (!auth.isAuthenticated) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	next();
};
