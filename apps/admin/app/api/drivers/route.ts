import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxicity/database";
import { auth } from "@clerk/nextjs/server";

export async function GET(_req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const drivers = await prisma.driver.findMany({
			include: {
				taxis: true,
				_count: {
					select: {
						vehicleTrips: true,
						reports: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(drivers);
	} catch (error) {
		console.error("Error fetching drivers:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
