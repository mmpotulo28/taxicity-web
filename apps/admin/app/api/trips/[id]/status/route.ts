import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxiciti/database";
import { auth } from "@clerk/nextjs/server";

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function PATCH(_req: NextRequest, context: RouteContext) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await context.params;
		const body = await _req.json();

		if (!body.status) {
			return NextResponse.json({ error: "Status is required" }, { status: 400 });
		}

		const trip = await prisma.trip.update({
			where: { id },
			data: {
				status: body.status,
				...(body.status === "CANCELLED" && body.cancelReason ? { cancelReason: body.cancelReason } : {}),
			},
			include: {
				route: {
					include: {
						sourceRank: true,
						destRank: true,
					},
				},
				vehicleTrip: {
					include: {
						driver: true,
						taxi: true,
					},
				},
			},
		});

		return NextResponse.json(trip);
	} catch (error) {
		console.error("Error updating trip status:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
