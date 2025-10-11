import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

// Validation schemas
const CreateRouteSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	distance: z.number().positive(),
	baseFare: z.number().positive(),
	estimatedDuration: z.number().positive(),
	sourceRankId: z.string().uuid(),
	destRankId: z.string().uuid().optional(),
	status: z.enum(["ACTIVE", "BUSY", "INACTIVE"]).default("ACTIVE"),
});

const UpdateRouteSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	distance: z.number().positive().optional(),
	baseFare: z.number().positive().optional(),
	estimatedDuration: z.number().positive().optional(),
	status: z.enum(["ACTIVE", "BUSY", "INACTIVE"]).optional(),
});

// GET /api/routes - Get all routes with optional filtering
export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const status = url.searchParams.get("status");
		const sourceRankId = url.searchParams.get("sourceRankId");
		const destRankId = url.searchParams.get("destRankId");
		const page = parseInt(url.searchParams.get("page") || "1");
		const limit = parseInt(url.searchParams.get("limit") || "20");
		const skip = (page - 1) * limit;

		const where: any = {};

		if (status) {
			where.status = status;
		}

		if (sourceRankId) {
			where.sourceRankId = sourceRankId;
		}

		if (destRankId) {
			where.destRankId = destRankId;
		}

		const [routes, total] = await Promise.all([
			prisma.route.findMany({
				where,
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
					_count: {
						select: {
							taxis: true,
							trips: true,
						},
					},
				},
				orderBy: { name: "asc" },
				skip,
				take: limit,
			}),
			prisma.route.count({ where }),
		]);

		return NextResponse.json({
			routes,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching routes:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// POST /api/routes - Create a new route (admin only)
export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// TODO: Add admin role check here

		const body = await req.json();
		const parsed = CreateRouteSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid data", details: parsed.error.issues },
				{ status: 400 },
			);
		}

		// Verify source rank exists
		const sourceRank = await prisma.rank.findUnique({
			where: { id: parsed.data.sourceRankId },
		});

		if (!sourceRank) {
			return NextResponse.json({ error: "Source rank not found" }, { status: 404 });
		}

		// Verify destination rank exists if provided
		if (parsed.data.destRankId) {
			const destRank = await prisma.rank.findUnique({
				where: { id: parsed.data.destRankId },
			});

			if (!destRank) {
				return NextResponse.json({ error: "Destination rank not found" }, { status: 404 });
			}
		}

		const route = await prisma.route.create({
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

		return NextResponse.json(route, { status: 201 });
	} catch (error) {
		console.error("Error creating route:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
