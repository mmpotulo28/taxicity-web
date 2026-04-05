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

		// Fetch route basic info
		const route = await prisma.route.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				baseFare: true,
				distance: true,
				estimatedDuration: true,
				status: true,
				sourceRank: {
					select: {
						name: true,
						city: true,
					},
				},
				destRank: {
					select: {
						name: true,
						city: true,
					},
				},
			},
		});

		if (!route) {
			return NextResponse.json({ error: "Route not found" }, { status: 404 });
		}

		// Fetch performance metrics in parallel
		const [tripCount, recentTrips] = await Promise.all([
			// Total trips count
			prisma.trip.count({
				where: { routeId: id },
			}),
			// Recent trips
			prisma.trip.findMany({
				where: { routeId: id },
				take: 10,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					status: true,
					fare: true,
					pickupTime: true,
					dropoffTime: true,
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
		]);

		// Calculate average duration and fare from recent trips
		const completedTrips = recentTrips.filter((trip) => trip.pickupTime && trip.dropoffTime);

		const totalDuration = completedTrips.reduce((sum, trip) => {
			if (trip.pickupTime && trip.dropoffTime) {
				const durationMs = trip.dropoffTime.getTime() - trip.pickupTime.getTime();
				return sum + durationMs / 60000; // Convert to minutes
			}
			return sum;
		}, 0);

		const totalFare = recentTrips.reduce((sum, trip) => {
			return sum + Number(trip.fare);
		}, 0);

		const avgDuration = completedTrips.length > 0 ? totalDuration / completedTrips.length : null;
		const avgFare = recentTrips.length > 0 ? totalFare / recentTrips.length : null;

		// Transform trips to include calculated duration
		const tripsWithDuration = recentTrips.map((trip) => {
			let duration: number | null = null;
			if (trip.pickupTime && trip.dropoffTime) {
				const durationMs = trip.dropoffTime.getTime() - trip.pickupTime.getTime();
				duration = Math.round(durationMs / 60000); // Round to nearest minute
			}
			return {
				id: trip.id,
				status: trip.status,
				fare: trip.fare,
				duration,
				createdAt: trip.createdAt,
				vehicleTrip: trip.vehicleTrip,
			};
		});

		return NextResponse.json({
			route,
			stats: {
				tripCount,
				avgDuration,
				avgFare,
			},
			recentTrips: tripsWithDuration,
		});
	} catch (error) {
		console.error("Error fetching route performance:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
