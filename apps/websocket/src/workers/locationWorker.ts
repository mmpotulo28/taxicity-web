import { Worker, Job } from "bullmq";
import { prisma } from "@taxiciti/database";
import { logger } from "@taxiciti/utils";
import { redis } from "../utils/redis.js";

const QUEUE_NAME = "location-history-queue";
const BATCH_SIZE = 50;
const BATCH_TIMEOUT_MS = 10000;

interface LocationJobData {
	driverId: string;
	taxiId: string;
	lat: number;
	lng: number;
	heading: number;
	speed: number;
	timestamp: number;
}

// In-memory buffer for batching
let locationBuffer: LocationJobData[] = [];
let batchTimer: NodeJS.Timeout | null = null;

const flushBuffer = async () => {
	if (locationBuffer.length === 0) return;

	const batch = [...locationBuffer];
	locationBuffer = []; // Clear buffer immediately
	if (batchTimer) {
		clearTimeout(batchTimer);
		batchTimer = null;
	}

	try {
		logger.info(`Flushing ${batch.length} location records to DB...`);

		// Use createMany for bulk insert (Postgres)
		await prisma.taxiLocation.createMany({
			data: batch.map((loc) => ({
				taxiHistoryId: loc.taxiId,
				lat: loc.lat,
				lng: loc.lng,
				heading: loc.heading,
				speed: loc.speed,
				createdAt: new Date(loc.timestamp),
			})),
		});

		logger.info(`Successfully saved ${batch.length} records.`);
	} catch (error) {
		logger.error(error, "Failed to flush location batch");
		// In a real scenario, you might want to re-queue these or save to a dead-letter list
	}
};

const processJob = async (job: Job<LocationJobData>) => {
	locationBuffer.push(job.data);

	if (locationBuffer.length >= BATCH_SIZE) {
		await flushBuffer();
	} else if (!batchTimer) {
		batchTimer = setTimeout(() => {
			flushBuffer();
		}, BATCH_TIMEOUT_MS);
	}
};

export const startLocationWorker = () => {
	// create a new connection for the worker as blocking commands are used
	const workerConnection = redis.duplicate({ maxRetriesPerRequest: null });

	const worker = new Worker(QUEUE_NAME, processJob, {
		connection: workerConnection,
		concurrency: 1, // Single concurrency since we are buffering in memory per worker
	});

	worker.on("completed", (job) => {
		// Job completed
		// logger.debug(`Job ${job.id} completed`);
	});

	worker.on("failed", (job, err) => {
		logger.error(err, `Job ${job?.id} failed`);
	});

	logger.info("Location Worker started");

	// Handle graceful shutdown to flush remaining items
	process.on("SIGTERM", async () => {
		await flushBuffer();
		await worker.close();
	});
};
