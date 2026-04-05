import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxiciti/database";
import { auth } from "@clerk/nextjs/server";

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await context.params;

		// Verify rank exists
		const rank = await prisma.rank.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				city: true,
				province: true,
				isActive: true,
			},
		});

		if (!rank) {
			return NextResponse.json({ error: "Rank not found" }, { status: 404 });
		}

		// Fetch performance metrics in parallel
		const [tripStats, routeStats, queueCount, recentTrips, busiestRoutes] = await Promise.all([
			// Trip statistics
			prisma.trip.aggregate({
				where: { rankId: id },
				_count: true,
				_avg: { fare: true },
			}),
			// Route statistics
			prisma.route.count({
				where: {
					OR: [{ sourceRankId: id }, { destRankId: id }],
					status: "ACTIVE",
				},
			}),
			// Queue statistics
			prisma.rankQueueEntry.count({
				where: { rankId: id },
			}),
			// Recent trips
			prisma.trip.findMany({
				where: { rankId: id },
				take: 5,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					status: true,
					fare: true,
					createdAt: true,
					vehicleTrip: {
						select: {
							driver: {
								select: {
									fullName: true,
									firstName: true,
									lastName: true,
								},
							},
						},
					},
				},
			}),
			// Busiest routes
			prisma.route.findMany({
				where: {
					OR: [{ sourceRankId: id }, { destRankId: id }],
					status: "ACTIVE",
				},
				take: 5,
				orderBy: {
					trips: {
						_count: "desc",
					},
				},
				select: {
					id: true,
					name: true,
					baseFare: true,
					distance: true,
					sourceRank: {
						select: {
							name: true,
						},
					},
					destRank: {
						select: {
							name: true,
						},
					},
					_count: {
						select: {
							trips: true,
						},
					},
				},
			}),
		]);

		return NextResponse.json({
			rank,
			stats: {
				trips: {
					count: tripStats._count,
					avgFare: tripStats._avg.fare,
				},
				routeCount: routeStats,
				queueCount,
			},
			recentTrips,
			busiestRoutes,
		});
	} catch (error) {
		console.error("Error fetching rank performance:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
