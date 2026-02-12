import { Queue } from "bullmq";
import { redis } from "../utils/redis.js";
import { logger } from "@taxiciti/utils";

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
