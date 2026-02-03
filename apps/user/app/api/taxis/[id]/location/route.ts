import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

import { prisma } from "@taxiciti/database";

// Validation schemas
const UpdateLocationSchema = z.object({
	lat: z.number(),
	lng: z.number(),
	heading: z.number().optional(),
	speed: z.number().optional(),
});

// GET /api/taxis/[id]/location - Get taxi's current location
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const location = await prisma.taxiLocation.findFirst({
			where: { taxiId: id },
			orderBy: { createdAt: "desc" },
		});

		if (!location) {
			return NextResponse.json({ error: "Location not found" }, { status: 404 });
		}

		return NextResponse.json(location);
	} catch (error) {
		console.error("Error fetching taxi location:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// PUT /api/taxis/[id]/location - Update taxi's location
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// TODO: Verify user is the driver of this taxi or is admin

		const body = await req.json();
		const parsed = UpdateLocationSchema.safeParse(body);

		if (!parsed.success) {
			console.error("Validation error:", parsed.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
		}

		// Verify taxi exists
		const taxi = await prisma.taxi.findUnique({
			where: { id },
		});

		if (!taxi) {
			return NextResponse.json({ error: "Taxi not found" }, { status: 404 });
		}

		// Update current location and add to history
		const [currentLocation] = await Promise.all([
			prisma.taxiLocation.upsert({
				where: { taxiId: id },
				update: parsed.data,
				create: {
					...parsed.data,
					taxiId: id,
				},
			}),
			// Add to location history
			prisma.taxiLocation.create({
				data: {
					...parsed.data,
					taxiHistoryId: id,
				},
			}),
		]);

		return NextResponse.json(currentLocation);
	} catch (error) {
		console.error("Error updating taxi location:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
