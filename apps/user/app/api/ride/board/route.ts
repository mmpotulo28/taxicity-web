import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@taxicity/database";
import { z } from "zod";

const BoardingSchema = z.object({
	vehicleTripId: z.string(),
	taxiId: z.string().optional(),
	lat: z.number().optional(),
	lng: z.number().optional(),
});

// POST /api/ride/board - Passenger scans QR code to board
export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const body = await req.json();
		const parse = BoardingSchema.safeParse(body);

		if (!parse.success) {
			return NextResponse.json({ error: "Invalid data" }, { status: 400 });
		}

		const { vehicleTripId, taxiId, lat, lng } = parse.data;

		// 1. Verify Vehicle Trip exists and is active
		const vehicleTrip = await prisma.vehicleTrip.findUnique({
			where: { id: vehicleTripId },
			include: {
				route: true,
				taxi: true,
			},
		});

		if (!vehicleTrip) {
			return NextResponse.json({ error: "Trip not found" }, { status: 404 });
		}

		if (!["BOARDING", "IN_PROGRESS"].includes(vehicleTrip.status)) {
			return NextResponse.json({ error: "Trip is not active" }, { status: 400 });
		}

		// Verify taxiId if provided (Security check)
		if (taxiId && vehicleTrip.taxiId !== taxiId) {
			return NextResponse.json({ error: "QR Code does not match this vehicle" }, { status: 400 });
		}

		// 2. Check if user has an existing request for this trip (or generic request)
		const existingTrip = await prisma.trip.findFirst({
			where: {
				userId,
				status: { in: ["ACCEPTED", "ARRIVED_AT_PICKUP"] },
				// Either linked to this vehicle trip OR just a request on the same route
				OR: [
					{ vehicleTripId },
					{ vehicleTripId: null }, // If it was just a request not yet linked (shouldn't happen if accepted, but possible)
				],
			},
			orderBy: { createdAt: "desc" },
		});

		if (existingTrip) {
			// Confirm Boarding
			const updatedTrip = await prisma.trip.update({
				where: { id: existingTrip.id },
				data: {
					status: "IN_PROGRESS",
					vehicleTripId, // Ensure it's linked
					taxiId: vehicleTrip.taxiId,
					pickupTime: new Date(),
					// Update pickup location if provided and not set? No, keep original request.
				},
			});
			return NextResponse.json({ message: "Boarding confirmed", trip: updatedTrip });
		} else {
			// Hop-on Logic (User scans without a prior request)
			// Create a new trip directly in IN_PROGRESS status

			// We need a dropoff... for now, let's assume it's an open-ended trip or user sets it later.
			// Or we require dropoff in the UI.
			// For this iteration, let's assume "Hop-on" creates a trip with "Unknown" dropoff or requires update.
			// But the prompt says "register the user to the trip joining it".

			// Let's create a trip.
			const newTrip = await prisma.trip.create({
				data: {
					userId,
					vehicleTripId,
					taxiId: vehicleTrip.taxiId,
					routeId: vehicleTrip.routeId,
					rankId: "unknown", // TODO: Handle rank
					pickupAddress: "Hop-on Location", // Should reverse geocode
					pickupLat: lat || 0,
					pickupLng: lng || 0,
					dropoffAddress: "TBD",
					dropoffLat: 0,
					dropoffLng: 0,
					fare: 0, // TBD
					status: "IN_PROGRESS",
					pickupTime: new Date(),
				},
			});

			return NextResponse.json({ message: "Joined trip", trip: newTrip });
		}
	} catch (error) {
		console.error("Error boarding trip:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
