import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

// Validation schemas
const SavedLocationSchema = z.object({
	name: z.string().min(1),
	address: z.string().min(1),
	lat: z.number(),
	lng: z.number(),
	type: z.string().min(1),
});

const UpdateSavedLocationSchema = z.object({
	name: z.string().min(1).optional(),
	address: z.string().min(1).optional(),
	lat: z.number().optional(),
	lng: z.number().optional(),
	type: z.string().min(1).optional(),
});

// GET /api/users/saved-locations - Get user's saved locations
export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const locations = await prisma.savedLocation.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json(locations);
	} catch (error) {
		console.error("Error fetching saved locations:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// POST /api/users/saved-locations - Create a new saved location
export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const parsed = SavedLocationSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid data", details: parsed.error.issues },
				{ status: 400 },
			);
		}

		const location = await prisma.savedLocation.create({
			data: {
				...parsed.data,
				userId,
			},
		});

		return NextResponse.json(location, { status: 201 });
	} catch (error) {
		console.error("Error creating saved location:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
