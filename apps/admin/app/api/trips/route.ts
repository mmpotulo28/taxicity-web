import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxyciti/database";
import { auth } from "@clerk/nextjs/server";

export async function GET(_req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const trips = await prisma.trip.findMany({
			take: 50, // Limit for now to prevent massive payloads
			orderBy: {
				requestTime: "desc",
			},
			include: {
				route: true, // Include the requested route details
				vehicleTrip: {
					include: {
						driver: true,
						route: true,
						taxi: true,
					},
				},
			},
		});

		return NextResponse.json(trips);
	} catch (error) {
		console.error("Error fetching trips:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
