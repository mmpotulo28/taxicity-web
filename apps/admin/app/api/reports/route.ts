import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxicity/database";
import { auth } from "@clerk/nextjs/server";

export async function GET(_req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get last 30 days of trips
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const trips = await prisma.trip.findMany({
			where: {
				requestTime: {
					gte: thirtyDaysAgo,
				},
				status: "COMPLETED",
			},
			select: {
				requestTime: true,
				fare: true,
			},
			orderBy: {
				requestTime: "asc",
			},
		});

		// specific aggregation for revenue chart
		const revenueMap = new Map<string, number>();
		let totalRevenue = 0;

		trips.forEach((trip) => {
			const date = new Date(trip.requestTime).toISOString().split("T")[0];
			const fare = Number(trip.fare);

			totalRevenue += fare;
			revenueMap.set(date, (revenueMap.get(date) || 0) + fare);
		});

		// Convert map to array and sort
		const revenueData = Array.from(revenueMap.entries())
			.map(([date, revenue]) => ({
				name: date,
				revenue,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));

		return NextResponse.json({
			revenueData,
			totalRevenue,
			totalTrips: trips.length,
		});
	} catch (error) {
		console.error("Error fetching reports:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
