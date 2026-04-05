import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({
	adapter,
	log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export { prisma };
export * from "./redis.js";
