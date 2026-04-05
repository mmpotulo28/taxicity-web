import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@taxiciti/database";
import { auth } from "@clerk/nextjs/server";

// Schema for updating a route
const updateRouteSchema = z
	.object({
		name: z.string().min(1).optional(),
		description: z.string().optional(),
		baseFare: z.number().positive().optional(),
		polyline: z.string().optional(),
		distance: z.number().positive().optional(),
		estimatedDuration: z.number().int().positive().optional(),
		status: z.enum(["ACTIVE", "BUSY", "INACTIVE"]).optional(),
	})
	.strict();

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const route = await prisma.route.findUnique({
			where: { id: params.id },
			include: {
				sourceRank: true,
				destRank: true,
				popularLocations: true,
			},
		});

		if (!route) {
			return NextResponse.json({ error: "Route not found" }, { status: 404 });
		}

		return NextResponse.json(route);
	} catch (error) {
		console.error("Error fetching route:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();

		// Validate request body with Zod
		const validation = updateRouteSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json({ error: "Validation failed", details: validation.error.issues }, { status: 400 });
		}

		// Build update data object, excluding undefined values
		type RouteUpdateData = {
			name?: string;
			description?: string;
			baseFare?: number;
			polyline?: string;
			distance?: number;
			estimatedDuration?: number;
			status?: "ACTIVE" | "BUSY" | "INACTIVE";
		};
		const updateData: RouteUpdateData = {};
		if (validation.data.name !== undefined) updateData.name = validation.data.name;
		if (validation.data.description !== undefined) updateData.description = validation.data.description;
		if (validation.data.baseFare !== undefined) updateData.baseFare = validation.data.baseFare;
		if (validation.data.polyline !== undefined) updateData.polyline = validation.data.polyline;
		if (validation.data.distance !== undefined) updateData.distance = validation.data.distance;
		if (validation.data.estimatedDuration !== undefined) updateData.estimatedDuration = validation.data.estimatedDuration;
		if (validation.data.status !== undefined) updateData.status = validation.data.status;

		const updatedRoute = await prisma.route.update({
			where: { id: params.id },
			data: updateData,
			include: {
				sourceRank: true,
				destRank: true,
				popularLocations: true,
			},
		});

		return NextResponse.json(updatedRoute);
	} catch (error) {
		console.error("Error updating route:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await prisma.route.delete({
			where: { id: params.id },
		});

		return NextResponse.json({ message: "Route deleted successfully" });
	} catch (error) {
		console.error("Error deleting route:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
