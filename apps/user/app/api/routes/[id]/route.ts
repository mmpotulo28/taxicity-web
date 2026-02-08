import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

import { prisma } from "@taxiciti/database";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";

// Validation schemas
const UpdateRouteSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	distance: z.number().positive().optional(),
	baseFare: z.number().positive().optional(),
	estimatedDuration: z.number().positive().optional(),
	status: z.enum(["ACTIVE", "BUSY", "INACTIVE"]).optional(),
});

// GET /api/routes/[id] - Get specific route
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const route = await prisma.route.findUnique({
			where: { id },
			include: {
				sourceRank: {
					select: {
						id: true,
						name: true,
						address: true,
						lat: true,
						lng: true,
						phone: true,
						operatingHours: true,
					},
				},
				destRank: {
					select: {
						id: true,
						name: true,
						address: true,
						lat: true,
						lng: true,
						phone: true,
						operatingHours: true,
					},
				},
				taxis: {
					include: {
						taxi: {
							include: {
								driver: {
									select: {
										id: true,
										firstName: true,
										lastName: true,
										phone: true,
										profileImage: true,
									},
								},
								currentLocation: true,
							},
						},
					},
					where: {
						isActive: true,
					},
				},
				_count: {
					select: {
						trips: true,
						userPreferences: true,
					},
				},
			},
		});

		if (!route) {
			return NextResponse.json({ error: "Route not found" }, { status: 404 });
		}

		return NextResponse.json(route);
	} catch (error) {
		console.error("Error fetching route:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// PUT /api/routes/[id] - Update route (admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!(await isAdmin())) {
			return unauthorizedResponse();
		}

		const body = await req.json();
		const parsed = UpdateRouteSchema.safeParse(body);

		if (!parsed.success) {
			console.error("Validation error:", parsed.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
		}

		// Check if route exists
		const existingRoute = await prisma.route.findUnique({
			where: { id },
		});

		if (!existingRoute) {
			return NextResponse.json({ error: "Route not found" }, { status: 404 });
		}

		const route = await prisma.route.update({
			where: { id },
			data: parsed.data,
			include: {
				sourceRank: {
					select: {
						id: true,
						name: true,
						address: true,
						lat: true,
						lng: true,
					},
				},
				destRank: {
					select: {
						id: true,
						name: true,
						address: true,
						lat: true,
						lng: true,
					},
				},
			},
		});

		return NextResponse.json(route);
	} catch (error) {
		console.error("Error updating route:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// DELETE /api/routes/[id] - Delete route (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		if (!(await isAdmin())) {
			return unauthorizedResponse();
		}

		// TODO: Add admin role check here

		// Check if route exists
		const existingRoute = await prisma.route.findUnique({
			where: { id },
			include: {
				_count: {
					select: {
						trips: true,
						taxis: true,
					},
				},
			},
		});

		if (!existingRoute) {
			return NextResponse.json({ error: "Route not found" }, { status: 404 });
		}

		// Check if route has active trips or taxis
		if (existingRoute._count.trips > 0 || existingRoute._count.taxis > 0) {
			return NextResponse.json({ error: "Cannot delete route with active trips or assigned taxis" }, { status: 400 });
		}

		await prisma.route.delete({
			where: { id },
		});

		return NextResponse.json({ message: "Route deleted successfully" });
	} catch (error) {
		console.error("Error deleting route:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
