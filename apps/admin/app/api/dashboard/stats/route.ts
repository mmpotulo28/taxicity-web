import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxiciti/database";
import { auth } from "@clerk/nextjs/server";

export async function GET(_req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const now = new Date();
		const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

		// Run queries in parallel
		const [availableTaxisCount, activeTripsCount, pendingDriversCount, todayRevenueAgg] = await Promise.all([
			// Available Taxis
			prisma.taxi.count({
				where: {
					status: "AVAILABLE",
				},
			}),
			// Active Trips (Trips in progress)
			prisma.trip.count({
				where: {
					status: "IN_PROGRESS",
				},
			}),
			// Pending Driver Approvals
			prisma.driver.count({
				where: {
					status: "PENDING_VERIFICATION",
				},
			}),
			// Today's Revenue
			prisma.trip.aggregate({
				_sum: {
					fare: true,
				},
				where: {
					status: "COMPLETED",
					dropoffTime: {
						gte: todayStart,
						lte: todayEnd,
					},
				},
			}),
		]);

		return NextResponse.json({
			availableTaxis: availableTaxisCount,
			activeTrips: activeTripsCount,
			pendingApprovals: pendingDriversCount,
			todayRevenue: Number(todayRevenueAgg._sum.fare || 0),
		});
	} catch (error) {
		console.error("Error fetching dashboard stats:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
