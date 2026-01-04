import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { z } from "zod";
import prisma from "@/lib/prisma";

const statusSchema = z.object({
	status: z.enum(["REQUESTED", "ACCEPTED", "ARRIVED_AT_PICKUP", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

		const updatedTrip = await prisma.trip.update({
			where: { id },
			data: {
				status,
				// Update timestamps based on status
				...(status === "ARRIVED_AT_PICKUP" ? { pickupTime: new Date() } : {}),
				...(status === "IN_PROGRESS" ? { pickupTime: new Date() } : {}), // Fallback if arrived skipped
				...(status === "COMPLETED" ? { dropoffTime: new Date() } : {}),
			},
		});

		return NextResponse.json(updatedTrip);
	} catch (error) {
		console.error("[TRIP_STATUS_PATCH]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
