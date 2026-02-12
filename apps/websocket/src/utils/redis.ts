import Redis from "ioredis";
import { config } from "../config/env";
import { logger } from "./logger";

export const redis = new Redis(config.redisUrl);

redis.on("error", (err) => logger.error(err, "Redis Client Error"));
redis.on("connect", () => logger.info("Redis Client Connected"));
