import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxiciti/database";
import { auth } from "@clerk/nextjs/server";

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, context: RouteContext) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await context.params;

		const trip = await prisma.trip.findUnique({
			where: { id },
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
				rating: true,
			},
		});

		if (!trip) {
			return NextResponse.json({ error: "Trip not found" }, { status: 404 });
		}

		return NextResponse.json(trip);
	} catch (error) {
		console.error("Error fetching trip:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function PATCH(_req: NextRequest, context: RouteContext) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await context.params;
		const body = await _req.json();

		// Only allow updating certain fields (status, cancelReason, etc.)
		const allowedUpdates: any = {};
		if (body.status) allowedUpdates.status = body.status;
		if (body.cancelReason) allowedUpdates.cancelReason = body.cancelReason;
		if (body.paymentStatus) allowedUpdates.paymentStatus = body.paymentStatus;

		const updatedTrip = await prisma.trip.update({
			where: { id },
			data: allowedUpdates,
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
				rating: true,
			},
		});

		return NextResponse.json(updatedTrip);
	} catch (error) {
		console.error("Error updating trip:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
