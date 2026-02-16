import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxiciti/database";
import { auth } from "@clerk/nextjs/server";

export async function GET(_req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Calculate date range for the last 7 days safely with standard JS Date
		const today = new Date();
		today.setHours(23, 59, 59, 999);

		const sevenDaysAgo = new Date(today);
		sevenDaysAgo.setDate(today.getDate() - 6);
		sevenDaysAgo.setHours(0, 0, 0, 0);

		// Fetch all completed trips for last 7 days
		const allRecentTrips = await prisma.trip.findMany({
			where: {
				createdAt: {
					gte: sevenDaysAgo,
					lte: today,
				},
				status: "COMPLETED",
			},
			select: {
				createdAt: true,
				fare: true,
				paymentMethod: true,
			},
		});

		// Initialize 7 days activity data map
		const dailyMap = new Map();
		const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

		for (let i = 6; i >= 0; i--) {
			const d = new Date(today);
			d.setDate(today.getDate() - i);
			const label = dayNames[d.getDay()];
			dailyMap.set(label, { name: label, trips: 0, revenue: 0 });
		}

		// Fill with real data from DB
		allRecentTrips.forEach((trip) => {
			const tripDate = new Date(trip.createdAt);
			const label = dayNames[tripDate.getDay()];
			if (dailyMap.has(label)) {
				const dayData = dailyMap.get(label);
				dayData.trips += 1;
				dayData.revenue += Number(trip.fare || 0);
			}
		});

		const finalActivityData = Array.from(dailyMap.values());

		// Revenue Breakdown by Payment Method (aggregated in JS from the same fetch)
		const breakdownMap = new Map();

		const methodColors: Record<string, string> = {
			CASH: "#0070F3",
			QR_CODE: "#10B981",
			MOBILE_MONEY: "#F59E0B",
		};

		allRecentTrips.forEach((trip) => {
			const method = trip.paymentMethod;
			const current = breakdownMap.get(method) || 0;
			breakdownMap.set(method, current + Number(trip.fare || 0));
		});

		const finalBreakdownData = Array.from(breakdownMap.entries()).map(([method, total]) => ({
			name: method
				.replace("_", " ")
				.toLowerCase()
				.replace(/^\w/, (c) => c.toUpperCase()),
			value: total,
			color: methodColors[method] || "#666666",
		}));

		// Handle empty breakdown data
		if (finalBreakdownData.length === 0) {
			finalBreakdownData.push({ name: "No Data", value: 0, color: "#cbd5e1" });
		}

		return NextResponse.json({
			activity: finalActivityData,
			revenueBreakdown: finalBreakdownData,
		});
	} catch (error) {
		console.error("Error fetching dashboard charts:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
