import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

// Initialize Prisma Client with Accelerate
const prisma = new PrismaClient().$extends(withAccelerate());

export default prisma;
