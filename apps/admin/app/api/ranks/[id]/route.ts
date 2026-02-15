import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxiciti/database";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

interface RouteContext {
	params: Promise<{ id: string }>;
}

const RankUpdateSchema = z.object({
	name: z.string().min(3).optional(),
	address: z.string().min(5).optional(),
	city: z.string().min(2).optional(),
	province: z.string().min(2).optional(),
	region: z.string().min(2).optional(),
	description: z.string().optional().nullable(),
	lat: z.number().min(-90).max(90).optional(),
	lng: z.number().min(-180).max(180).optional(),
	phone: z.string().optional().nullable(),
	operatingHours: z.string().optional().nullable(),
	capacity: z.number().int().positive().optional().nullable(),
	image: z.string().url().optional().nullable(),
	isActive: z.boolean().optional(),
});

export async function GET(_req: NextRequest, context: RouteContext) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await context.params;

		const rank = await prisma.rank.findUnique({
			where: { id },
			include: {
				sourceRoutes: {
					select: {
						id: true,
						name: true,
						distance: true,
						estimatedDuration: true,
						baseFare: true,
						status: true,
						destRank: {
							select: {
								name: true,
								city: true,
							},
						},
					},
				},
				destRoutes: {
					select: {
						id: true,
						name: true,
						distance: true,
						estimatedDuration: true,
						baseFare: true,
						status: true,
						sourceRank: {
							select: {
								name: true,
								city: true,
							},
						},
					},
				},
				_count: {
					select: {
						taxiRanks: true,
						sourceRoutes: true,
						destRoutes: true,
						queueEntries: true,
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
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest, context: RouteContext) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await context.params;
		const body = await req.json();

		// Validate request body
		const validation = RankUpdateSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					issues: validation.error.issues.map((issue) => ({
						path: issue.path.join("."),
						message: issue.message,
					})),
				},
				{ status: 400 },
			);
		}

		// Check if rank exists
		const existingRank = await prisma.rank.findUnique({ where: { id } });
		if (!existingRank) {
			return NextResponse.json({ error: "Rank not found" }, { status: 404 });
		}

		const validatedData = validation.data;

		const rank = await prisma.rank.update({
			where: { id },
			data: validatedData,
			include: {
				_count: {
					select: {
						taxiRanks: true,
						sourceRoutes: true,
						destRoutes: true,
						queueEntries: true,
						trips: true,
					},
				},
			},
		});

		return NextResponse.json(rank);
	} catch (error) {
		console.error("Error updating rank:", error);
		return NextResponse.json({ error: "Failed to update rank" }, { status: 500 });
	}
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await context.params;

		// Check if rank exists
		const existingRank = await prisma.rank.findUnique({
			where: { id },
			include: {
				_count: {
					select: {
						sourceRoutes: true,
						destRoutes: true,
						trips: true,
					},
				},
			},
		});

		if (!existingRank) {
			return NextResponse.json({ error: "Rank not found" }, { status: 404 });
		}

		// Prevent deletion if rank has active routes or trips
		const totalRoutes = existingRank._count.sourceRoutes + existingRank._count.destRoutes;
		if (totalRoutes > 0 || existingRank._count.trips > 0) {
			return NextResponse.json(
				{
					error: "Cannot delete rank with active routes or trips",
					details: {
						routes: totalRoutes,
						trips: existingRank._count.trips,
					},
				},
				{ status: 409 },
			);
		}

		await prisma.rank.delete({
			where: { id },
		});

		return NextResponse.json({ success: true, message: "Rank deleted successfully" });
	} catch (error) {
		console.error("Error deleting rank:", error);
		return NextResponse.json({ error: "Failed to delete rank" }, { status: 500 });
	}
}
