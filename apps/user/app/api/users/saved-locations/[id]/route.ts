import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

import { prisma } from "@taxiciti/database";

// Validation schemas
const UpdateSavedLocationSchema = z.object({
	name: z.string().min(1).optional(),
	address: z.string().min(1).optional(),
	lat: z.number().optional(),
	lng: z.number().optional(),
	type: z.string().min(1).optional(),
});

// GET /api/users/saved-locations/[id] - Get specific saved location
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const location = await prisma.savedLocation.findFirst({
			where: {
				id,
				userId, // Ensure user can only access their own locations
			},
		});

		if (!location) {
			return NextResponse.json({ error: "Location not found" }, { status: 404 });
		}

		return NextResponse.json(location);
	} catch (error) {
		console.error("Error fetching saved location:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// PUT /api/users/saved-locations/[id] - Update saved location
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const parsed = UpdateSavedLocationSchema.safeParse(body);

		if (!parsed.success) {
			console.error("Validation error:", parsed.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
		}

		// Verify location belongs to user
		const existingLocation = await prisma.savedLocation.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!existingLocation) {
			return NextResponse.json({ error: "Location not found" }, { status: 404 });
		}

		const location = await prisma.savedLocation.update({
			where: { id },
			data: parsed.data,
		});

		return NextResponse.json(location);
	} catch (error) {
		console.error("Error updating saved location:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// DELETE /api/users/saved-locations/[id] - Delete saved location
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Verify location belongs to user
		const existingLocation = await prisma.savedLocation.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!existingLocation) {
			return NextResponse.json({ error: "Location not found" }, { status: 404 });
		}

		await prisma.savedLocation.delete({
			where: { id },
		});

		return NextResponse.json({ message: "Location deleted successfully" });
	} catch (error) {
		console.error("Error deleting saved location:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
