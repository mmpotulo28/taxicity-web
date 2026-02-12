import express, { Request, Response, Router } from "express";
import { Server } from "socket.io";
import { apiAuthMiddleware } from "../middleware/auth";
import { logger } from "@taxiciti/utils";

export const createApiRouter = (io: Server): Router => {
	const router = express.Router();

	// Health check (public)
	router.get("/health", (req, res) => {
		res.json({ status: "ok", timestamp: new Date().toISOString() });
	});

	// Internal API Trigger Endpoint (Replaces Pusher Trigger)
	router.post("/trigger", apiAuthMiddleware, async (req: Request, res: Response) => {
		try {
			const { channel, event, data } = req.body;

			if (!channel || !event) {
				return res.status(400).json({ error: "Missing channel or event" });
			}

			// Emit the event to the channel
			io.to(channel).emit(event, data);

			logger.info(`[API Trigger] Channel: ${channel}, Event: ${event}`);
			return res.json({ status: "success" });
		} catch (error) {
			logger.error(error, "Trigger Error:");
			return res.status(500).json({ error: "Internal Server Error" });
		}
	});

	return router;
};
