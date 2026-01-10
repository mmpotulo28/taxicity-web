import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@taxicity/database";

// Schema for joining queue
const JoinQueueSchema = z.object({
	rankId: z.string(),
	taxiId: z.string(),
});

/**
 * GET - Check driver's current queue status
 */
export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Find driver profile
		const driver = await prisma.driver.findUnique({
			where: { userId },
		});

		if (!driver) {
			return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });
		}

		// Check if in queue
		const queueEntry = await prisma.rankQueueEntry.findUnique({
			where: { driverId: driver.id },
			include: {
				rank: {
					include: {
						sourceRoutes: true,
					},
				},
			},
		});

		if (!queueEntry) {
			return NextResponse.json({ inQueue: false });
		}

		// Calculate position
		// Count how many people joined this specific rank BEFORE me
		const position = await prisma.rankQueueEntry.count({
			where: {
				rankId: queueEntry.rankId,
				joinedAt: {
					lt: queueEntry.joinedAt,
				},
			},
		});

		// Count total length of this rank's queue
		const queueLength = await prisma.rankQueueEntry.count({
			where: {
				rankId: queueEntry.rankId,
			},
		});

		return NextResponse.json({
			inQueue: true,
			rank: {
				id: queueEntry.rankId,
				name: queueEntry.rank.name,
				sourceRoutes: queueEntry.rank.sourceRoutes,
			},
			position: position + 1, // 0-based index to 1-based position
			queueLength,
			joinedAt: queueEntry.joinedAt,
		});
	} catch (error) {
		console.error("Queue Status Error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

/**
 * POST - Join a rank queue
 */
export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const validation = JoinQueueSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json({ error: "Invalid data", details: validation.error.flatten() }, { status: 400 });
		}

		const { rankId, taxiId } = validation.data;

		// Find driver
		const driver = await prisma.driver.findUnique({
			where: { userId },
		});

		if (!driver) {
			return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });
		}

		// Check if already in queue
		const existing = await prisma.rankQueueEntry.findUnique({
			where: { driverId: driver.id },
		});

		if (existing) {
			return NextResponse.json({ error: "You are already in a queue. Leave first." }, { status: 409 });
		}

		// Join Queue
		const newEntry = await prisma.rankQueueEntry.create({
			data: {
				driverId: driver.id,
				rankId,
				taxiId,
			},
			include: {
				rank: true,
			},
		});

		// Get new position
		const position = await prisma.rankQueueEntry.count({
			where: {
				rankId: rankId,
				joinedAt: {
					lt: newEntry.joinedAt,
				},
			},
		});

		return NextResponse.json({
			success: true,
			rank: newEntry.rank.name,
			position: position + 1,
			joinedAt: newEntry.joinedAt,
		});
	} catch (error) {
		console.error("Join Queue Error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

/**
 * DELETE - Leave the queue
 */
export async function DELETE(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const driver = await prisma.driver.findUnique({ where: { userId } });
		if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 });

		await prisma.rankQueueEntry.delete({
			where: { driverId: driver.id },
		});

		return NextResponse.json({ success: true, message: "Left queue" });
	} catch (error) {
		// Determine if error is "Record not found"
		// Prisma throws specific errors, but generic handling is safe here
		console.error("Leave Queue Error:", error);
		return NextResponse.json({ error: "Failed to leave queue" }, { status: 500 });
	}
}
