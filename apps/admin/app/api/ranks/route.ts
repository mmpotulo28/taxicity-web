import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxiciti/database";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const RankCreateSchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters"),
	address: z.string().min(5, "Address must be at least 5 characters"),
	city: z.string().min(2, "City is required"),
	province: z.string().min(2, "Province is required"),
	region: z.string().min(2, "Region is required"),
	description: z.string().optional(),
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
	phone: z.string().optional(),
	operatingHours: z.string().optional(),
	capacity: z.number().int().positive().optional(),
	image: z.string().url().optional().nullable(),
});

export async function GET(_req: NextRequest) {
	try {
		const { userId } = await auth();
		// In a real admin dashboard, you'd check roles here.
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const ranks = await prisma.rank.findMany({
			include: {
				sourceRoutes: {
					where: { status: "ACTIVE" },
					select: {
						id: true,
						name: true,
						distance: true,
						estimatedDuration: true,
						baseFare: true,
					},
				},
				taxiRanks: {
					include: {
						taxi: {
							select: {
								id: true,
								licensePlate: true,
								model: true,
								status: true,
								driver: {
									select: {
										fullName: true,
										phone: true,
									},
								},
							},
						},
					},
				},
				queueEntries: {
					take: 50, // Limit queue entries for performance
					include: {
						taxi: {
							select: {
								id: true,
								licensePlate: true,
								model: true,
								status: true,
							},
						},
						driver: {
							select: {
								id: true,
								fullName: true,
								phone: true,
							},
						},
					},
					orderBy: {
						joinedAt: "asc",
					},
				},
				_count: {
					select: {
						taxiRanks: true, // Taxis present at rank (approx)
						sourceRoutes: true,
						queueEntries: true,
						trips: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(ranks);
	} catch (error) {
		console.error("Error fetching ranks:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();

		// Validate request body
		const validation = RankCreateSchema.safeParse(body);
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

		const validatedData = validation.data;

		// Check for duplicate rank name in same city
		const existingRank = await prisma.rank.findFirst({
			where: {
				name: validatedData.name,
				city: validatedData.city,
			},
		});

		if (existingRank) {
			return NextResponse.json({ error: "A rank with this name already exists in this city" }, { status: 409 });
		}

		const rank = await prisma.rank.create({
			data: {
				name: validatedData.name,
				address: validatedData.address,
				city: validatedData.city,
				province: validatedData.province,
				region: validatedData.region,
				description: validatedData.description,
				lat: validatedData.lat,
				lng: validatedData.lng,
				phone: validatedData.phone,
				operatingHours: validatedData.operatingHours,
				capacity: validatedData.capacity,
				image: validatedData.image,
			},
			include: {
				_count: {
					select: {
						taxiRanks: true,
						sourceRoutes: true,
						queueEntries: true,
						trips: true,
					},
				},
			},
		});

		return NextResponse.json(rank, { status: 201 });
	} catch (error) {
		console.error("Error creating rank:", error);
		return NextResponse.json({ error: "Failed to create rank" }, { status: 500 });
	}
}
