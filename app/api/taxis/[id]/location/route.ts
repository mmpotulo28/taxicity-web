import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

// Validation schemas
const UpdateLocationSchema = z.object({
	lat: z.number(),
	lng: z.number(),
	heading: z.number().optional(),
	speed: z.number().optional(),
});

// GET /api/taxis/[id]/location - Get taxi's current location
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const location = await prisma.taxiLocation.findFirst({
			where: { taxiId: params.id },
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
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// TODO: Verify user is the driver of this taxi or is admin

		const body = await req.json();
		const parsed = UpdateLocationSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid data", details: parsed.error.issues },
				{ status: 400 },
			);
		}

		// Verify taxi exists
		const taxi = await prisma.taxi.findUnique({
			where: { id: params.id },
		});

		if (!taxi) {
			return NextResponse.json({ error: "Taxi not found" }, { status: 404 });
		}

		// Update current location and add to history
		const [currentLocation] = await Promise.all([
			prisma.taxiLocation.upsert({
				where: { taxiId: params.id },
				update: parsed.data,
				create: {
					...parsed.data,
					taxiId: params.id,
				},
			}),
			// Add to location history
			prisma.taxiLocation.create({
				data: {
					...parsed.data,
					taxiHistoryId: params.id,
				},
			}),
		]);

		return NextResponse.json(currentLocation);
	} catch (error) {
		console.error("Error updating taxi location:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// GET /api/taxis/[id]/location/history - Get taxi's location history
export async function GET_HISTORY(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const url = new URL(req.url);
		const limit = parseInt(url.searchParams.get("limit") || "50");
		const page = parseInt(url.searchParams.get("page") || "1");
		const skip = (page - 1) * limit;

		const [locations, total] = await Promise.all([
			prisma.taxiLocation.findMany({
				where: { taxiHistoryId: params.id },
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.taxiLocation.count({
				where: { taxiHistoryId: params.id },
			}),
		]);

		return NextResponse.json({
			locations,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching taxi location history:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
