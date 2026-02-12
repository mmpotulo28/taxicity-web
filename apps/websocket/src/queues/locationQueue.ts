import { Queue } from "bullmq";
import { config } from "../config/env";
import { logger } from "../utils/logger";
import { redis } from "../utils/redis";

const QUEUE_NAME = "location-history-queue";

export const locationQueue = new Queue(QUEUE_NAME, {
	connection: redis, // Reuse the existing ioredis connection
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			type: "exponential",
			delay: 1000,
		},
		removeOnComplete: true,
		removeOnFail: false,
	},
});

locationQueue.on("error", (err) => {
	logger.error(err, "Location Queue Error");
});
