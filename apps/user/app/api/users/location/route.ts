import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

import { prisma } from "@taxicity/database";

// Validation schemas
const UpdateLocationSchema = z.object({
	lat: z.number(),
	lng: z.number(),
	accuracy: z.number().optional(),
});

const SavedLocationSchema = z.object({
	name: z.string().min(1),
	address: z.string().min(1),
	lat: z.number(),
	lng: z.number(),
	type: z.string().min(1),
});

// GET /api/users/location - Get user's current location
export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const location = await prisma.userLocation.findUnique({
			where: { userId },
		});

		return NextResponse.json(location);
	} catch (error) {
		console.error("Error fetching user location:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// PUT /api/users/location - Update user's current location
export async function PUT(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const parsed = UpdateLocationSchema.safeParse(body);

		if (!parsed.success) {
			console.error("Validation error:", parsed.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
		}

		const location = await prisma.userLocation.upsert({
			where: { userId },
			update: parsed.data,
			create: {
				...parsed.data,
				userId,
			},
		});

		return NextResponse.json(location);
	} catch (error) {
		console.error("Error updating user location:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
