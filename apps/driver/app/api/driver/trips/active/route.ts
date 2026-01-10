import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@taxicity/database";

export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		// Verify user is a driver
		const driver = await prisma.driver.findUnique({
			where: { userId },
			include: {
				taxis: true,
			},
		});

		if (!driver) {
			return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });
		}

		const taxiIds = driver.taxis.map((t: { id: string }) => t.id);

		// Fetch active trips for this driver's taxis
		const activeTrips = await prisma.trip.findMany({
			where: {
				taxiId: { in: taxiIds },
				status: { in: ["ACCEPTED", "ARRIVED_AT_PICKUP", "IN_PROGRESS"] },
			},
			orderBy: {
				requestTime: "desc",
			},
			include: {
				route: true,
				taxi: true,
			},
		});

		return NextResponse.json({ trips: activeTrips });
	} catch (error) {
		console.error("Error fetching active trip:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
