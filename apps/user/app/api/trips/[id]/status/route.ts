import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { z } from "zod";
import { prisma } from "@taxiciti/database";
import { pusherServer } from "@taxiciti/utils";

const statusSchema = z.object({
	status: z.enum(["REQUESTED", "ACCEPTED", "ARRIVED_AT_PICKUP", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = await auth();
		const { id } = await params;
		if (!userId) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const body = await req.json();
		const validation = statusSchema.safeParse(body);

		if (!validation.success) {
			return new NextResponse("Invalid status", { status: 400 });
		}

		const { status } = validation.data;

		// Verify trip belongs to user (or driver - but for now we assume user context)
		// In a real app, drivers would also hit this endpoint
		const trip = await prisma.trip.findUnique({
			where: { id },
		});

		if (!trip) {
			return new NextResponse("Trip not found", { status: 404 });
		}

		// Allow user to cancel, but maybe restrict other status updates to driver only?
		// For this demo/prototype, we allow the frontend to drive the state.

		const updateData: any = {
			status,
			// Update timestamps based on status
			...(status === "ARRIVED_AT_PICKUP" ? { pickupTime: new Date() } : {}),
			...(status === "IN_PROGRESS" ? { pickupTime: new Date() } : {}), // Fallback if arrived skipped
			...(status === "COMPLETED" ? { dropoffTime: new Date() } : {}),
		};

		// If status is IN_PROGRESS, ensure we have a pickup time if not already set
		if (status === "IN_PROGRESS" && !trip.pickupTime) {
			updateData.pickupTime = new Date();
		}

		const updatedTrip = await prisma.trip.update({
			where: { id },
			data: updateData,
		});

		if (status === "CANCELLED") {
			try {
				await pusherServer.trigger(`route-${trip.routeId}`, "trip-cancelled", {
					id: trip.id,
					reason: "Passenger cancelled the request.",
				});
			} catch (error) {
				console.error("Pusher trigger failed:", error);
			}
		}

		return NextResponse.json(updatedTrip);
	} catch (error) {
		console.error("[TRIP_STATUS_PATCH]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
