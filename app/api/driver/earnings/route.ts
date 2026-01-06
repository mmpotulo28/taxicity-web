import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const driver = await prisma.driver.findUnique({
			where: { userId },
		});

		if (!driver) {
			return NextResponse.json({ error: "Driver not found" }, { status: 404 });
		}

		// Fetch completed trips for this driver
		// Note: Trips are linked to VehicleTrip, which is linked to Driver
		// Or directly via taxiId if we assume driver owns the taxi for that trip
		// Better to use VehicleTrip relation
		const vehicleTrips = await prisma.vehicleTrip.findMany({
			where: {
				driverId: driver.id,
				status: "COMPLETED",
			},
			include: {
				passengers: {
					where: { status: "COMPLETED" },
				},
				route: true,
			},
			orderBy: { endTime: "desc" },
		});

		// Calculate earnings
		let totalEarnings = 0;
		let todayEarnings = 0;
		let weekEarnings = 0;
		let monthEarnings = 0;

		const now = new Date();
		const startOfDay = new Date(now.setHours(0, 0, 0, 0));
		const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const recentTrips: any[] = [];

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		vehicleTrips.forEach((vt: any) => {
			const tripDate = vt.endTime || vt.createdAt;
			let tripTotal = 0;

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			vt.passengers.forEach((p: any) => {
				const fare = Number(p.fare);
				tripTotal += fare;
				totalEarnings += fare;

				if (tripDate >= startOfDay) todayEarnings += fare;
				if (tripDate >= startOfWeek) weekEarnings += fare;
				if (tripDate >= startOfMonth) monthEarnings += fare;
			});

			if (recentTrips.length < 10) {
				recentTrips.push({
					id: vt.id,
					startTime: vt.startTime ? vt.startTime.toISOString() : tripDate.toISOString(),
					endTime: vt.endTime ? vt.endTime.toISOString() : tripDate.toISOString(),
					route: {
						name: vt.route?.name || "Unknown Route",
					},
					fare: 0, // Avg fare or N/A
					passengers: vt.passengers.length,
					totalAmount: tripTotal,
				});
			}
		});

		return NextResponse.json({
			total: totalEarnings,
			today: todayEarnings,
			week: weekEarnings,
			month: monthEarnings,
			trips: recentTrips,
		});
	} catch (error) {
		console.error("Error fetching earnings:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
