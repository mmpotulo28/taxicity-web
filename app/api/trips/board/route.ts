import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const BoardTripSchema = z.object({
	vehicleTripId: z.string(),
	taxiId: z.string(),
});

export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const body = await req.json();
		const parse = BoardTripSchema.safeParse(body);

		if (!parse.success) {
			return NextResponse.json({ error: "Invalid QR Code data" }, { status: 400 });
		}

		const { vehicleTripId, taxiId } = parse.data;

		// 1. Find the user's active trip request
		// We look for a trip that is ACCEPTED or ARRIVED_AT_PICKUP
		// And matches the taxiId (optional check, but good for security)
		const trip = await prisma.trip.findFirst({
			where: {
				userId,
				status: { in: ["ACCEPTED", "ARRIVED_AT_PICKUP"] },
				// We can optionally check if it's linked to this vehicleTrip or taxi
				// But sometimes the link happens now.
			},
			orderBy: { createdAt: "desc" },
		});

		if (!trip) {
			return NextResponse.json({ error: "No active booking found. Please request a ride first." }, { status: 404 });
		}

		// 2. Verify it matches the vehicle/taxi if already assigned
		if (trip.taxiId && trip.taxiId !== taxiId) {
			return NextResponse.json({ error: "This is not your assigned taxi." }, { status: 403 });
		}

		// 3. Update the trip status to IN_PROGRESS (Boarded)
		// And link to vehicleTrip if not already
		const updatedTrip = await prisma.trip.update({
			where: { id: trip.id },
			data: {
				status: "IN_PROGRESS",
				pickupTime: new Date(),
				vehicleTripId: vehicleTripId,
				taxiId: taxiId,
			},
		});

		// 4. Also ensure the vehicleTrip has this passenger (it should via the relation, but good to be safe)
		// The DriverContext polls for this, so it should update automatically.

		return NextResponse.json(updatedTrip);
	} catch (error) {
		console.error("Error boarding trip:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
