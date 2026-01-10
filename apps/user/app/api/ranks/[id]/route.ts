import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

import { prisma } from "@taxicity/database";

// Validation schemas
const UpdateRankSchema = z.object({
	name: z.string().min(1).optional(),
	address: z.string().min(1).optional(),
	city: z.string().min(1).optional(),
	province: z.string().min(1).optional(),
	region: z.string().min(1).optional(),
	description: z.string().optional(),
	lat: z.number().optional(),
	lng: z.number().optional(),
	phone: z.string().optional(),
	operatingHours: z.string().optional(),
	capacity: z.number().positive().optional(),
	image: z.string().optional(),
	isActive: z.boolean().optional(),
});

// GET /api/ranks/[id] - Get specific rank
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const rank = await prisma.rank.findUnique({
			where: { id },
			include: {
				sourceRoutes: {
					select: {
						id: true,
						name: true,
						distance: true,
						baseFare: true,
						estimatedDuration: true,
						status: true,
						destRank: {
							select: {
								id: true,
								name: true,
								address: true,
							},
						},
					},
				},
				destRoutes: {
					select: {
						id: true,
						name: true,
						distance: true,
						baseFare: true,
						estimatedDuration: true,
						status: true,
						sourceRank: {
							select: {
								id: true,
								name: true,
								address: true,
							},
						},
					},
				},
				taxiRanks: {
					include: {
						taxi: {
							include: {
								driver: {
									select: {
										id: true,
										firstName: true,
										lastName: true,
										phone: true,
									},
								},
								currentLocation: true,
							},
						},
					},
				},
				_count: {
					select: {
						sourceRoutes: true,
						destRoutes: true,
						taxiRanks: true,
						trips: true,
					},
				},
			},
		});

		if (!rank) {
			return NextResponse.json({ error: "Rank not found" }, { status: 404 });
		}

		return NextResponse.json(rank);
	} catch (error) {
		console.error("Error fetching rank:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// PUT /api/ranks/[id] - Update rank (admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// TODO: Add admin role check here

		const body = await req.json();
		const parsed = UpdateRankSchema.safeParse(body);

		if (!parsed.success) {
			console.error("Validation error:", parsed.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
		}

		// Check if rank exists
		const existingRank = await prisma.rank.findUnique({
			where: { id },
		});

		if (!existingRank) {
			return NextResponse.json({ error: "Rank not found" }, { status: 404 });
		}

		const rank = await prisma.rank.update({
			where: { id },
			data: parsed.data,
			include: {
				_count: {
					select: {
						sourceRoutes: true,
						destRoutes: true,
						taxiRanks: true,
					},
				},
			},
		});

		return NextResponse.json(rank);
	} catch (error) {
		console.error("Error updating rank:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// DELETE /api/ranks/[id] - Delete rank (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// TODO: Add admin role check here

		// Check if rank exists and has dependencies
		const existingRank = await prisma.rank.findUnique({
			where: { id },
			include: {
				_count: {
					select: {
						sourceRoutes: true,
						destRoutes: true,
						taxiRanks: true,
						trips: true,
					},
				},
			},
		});

		if (!existingRank) {
			return NextResponse.json({ error: "Rank not found" }, { status: 404 });
		}

		// Check if rank has dependencies
		const hasDependencies = existingRank._count.sourceRoutes > 0 || existingRank._count.destRoutes > 0 || existingRank._count.taxiRanks > 0 || existingRank._count.trips > 0;

		if (hasDependencies) {
			return NextResponse.json({ error: "Cannot delete rank with existing routes, taxis, or trips" }, { status: 400 });
		}

		await prisma.rank.delete({
			where: { id },
		});

		return NextResponse.json({ message: "Rank deleted successfully" });
	} catch (error) {
		console.error("Error deleting rank:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
