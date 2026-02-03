import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxiciti/database";
import { auth } from "@clerk/nextjs/server";

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
		const { name, address, city, province, region, lat, lng, capacity, operatingHours } = body;

		const rank = await prisma.rank.create({
			data: {
				name,
				address,
				city,
				province,
				region,
				lat: parseFloat(lat),
				lng: parseFloat(lng),
				capacity: parseInt(capacity),
				operatingHours,
			},
		});

		return NextResponse.json(rank);
	} catch (error) {
		console.error("Error creating rank:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
