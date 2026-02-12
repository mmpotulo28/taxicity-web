import { Redis } from "ioredis";
import { config } from "../configs/variables.js";
import { logger } from "@taxiciti/utils";

export const redis = new Redis(config.redisUrl);

redis.on("error", (err: Error) => logger.error(err, "Redis Client Error"));
console.log("Redis connecting..."); // Use console if logger fails
redis.on("connect", () => logger.info("Redis Client Connected"));
