import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@taxiciti/database";

// GET /api/trips - List user's trips
export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const trips = await prisma.trip.findMany({
			where: { userId },
			orderBy: { requestTime: "desc" },
			include: {
				route: true,
				taxi: {
					include: {
						driver: true,
					},
				},
				rank: true,
			},
		});
		return NextResponse.json(trips);
	} catch (error) {
		console.error("Error fetching trips:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
