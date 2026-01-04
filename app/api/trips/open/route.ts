import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// Fetch open trips that haven't been assigned a taxi yet
export async function GET(req: NextRequest) {
	// In a real app, we'd verify the user is a driver here.
	// For now, we'll just return open trips.

	try {
		const trips = await prisma.trip.findMany({
			where: {
				status: "REQUESTED",
			},
			orderBy: { requestTime: "desc" },
			include: {
				route: true,
				// user: true, // Removed because User model is not in Prisma (managed by Clerk)
			},
		});
		return NextResponse.json(trips);
	} catch (error) {
		console.error("Error fetching open trips:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
