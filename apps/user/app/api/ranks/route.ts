import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

import { prisma } from "@taxicity/database";

// Validation schemas
const CreateRankSchema = z.object({
	name: z.string().min(1),
	address: z.string().min(1),
	city: z.string().min(1),
	province: z.string().min(1),
	region: z.string().min(1),
	description: z.string().optional(),
	lat: z.number(),
	lng: z.number(),
	phone: z.string().optional(),
	operatingHours: z.string().optional(),
	capacity: z.number().positive().optional(),
	image: z.string().optional(),
});

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

// GET /api/ranks - Get all ranks with optional filtering
export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const region = url.searchParams.get("region");
		const city = url.searchParams.get("city");
		const isActive = url.searchParams.get("isActive");
		const page = parseInt(url.searchParams.get("page") || "1");
		const limit = parseInt(url.searchParams.get("limit") || "20");
		const skip = (page - 1) * limit;

		const where: any = {};

		if (region) {
			where.region = region;
		}

		if (city) {
			where.city = city;
		}

		if (isActive !== null && isActive !== undefined) {
			where.isActive = isActive === "true";
		}

		const [ranks, total] = await Promise.all([
			prisma.rank.findMany({
				where,
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
				orderBy: { name: "asc" },
				skip,
				take: limit,
			}),
			prisma.rank.count({ where }),
		]);

		return NextResponse.json({
			ranks,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching ranks:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

import { isAdmin, unauthorizedResponse } from "@/lib/auth";

// POST /api/ranks - Create a new rank (admin only)
export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const isUserAdmin = await isAdmin();
		if (!isUserAdmin) {
			return unauthorizedResponse();
		}

		const body = await req.json();
		const parsed = CreateRankSchema.safeParse(body);

		if (!parsed.success) {
			console.error("Validation error:", parsed.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
		}

		const rank = await prisma.rank.create({
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

		return NextResponse.json(rank, { status: 201 });
	} catch (error) {
		console.error("Error creating rank:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
