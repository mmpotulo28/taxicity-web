import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// POST /api/driver/vehicle-trips/[id]/passengers/[tripId]/accept - Accept a passenger onto the vehicle trip
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; tripId: string }> }) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const { id: vehicleTripId, tripId: passengerTripId } = await params;

		// 1. Verify Driver owns the VehicleTrip
		const vehicleTrip = await prisma.vehicleTrip.findUnique({
			where: { id: vehicleTripId },
			include: {
				driver: true,
				passengers: {
					where: { status: { in: ["ACCEPTED", "ARRIVED_AT_PICKUP", "IN_PROGRESS"] } },
				},
			},
		});

		if (!vehicleTrip) return NextResponse.json({ error: "Vehicle Trip not found" }, { status: 404 });

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const vt = vehicleTrip as any;
		if (vt.driver.userId !== userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

		// 2. Check Capacity
		if (vt.passengers.length >= vt.capacity) {
			return NextResponse.json({ error: "Vehicle is full" }, { status: 409 });
		}

		// 3. Verify Passenger Trip
		const passengerTrip = await prisma.trip.findUnique({
			where: { id: passengerTripId },
		});

		if (!passengerTrip) return NextResponse.json({ error: "Passenger request not found" }, { status: 404 });
		if (passengerTrip.status !== "REQUESTED") return NextResponse.json({ error: "Request no longer valid" }, { status: 400 });

		// 4. Link Passenger to Vehicle Trip
		const updatedPassengerTrip = await prisma.trip.update({
			where: { id: passengerTripId },
			data: {
				status: "ACCEPTED",
				vehicleTripId: vehicleTrip.id,
				taxiId: vehicleTrip.taxiId,
				acceptTime: new Date(),
			},
		});

		return NextResponse.json(updatedPassengerTrip);
	} catch (error) {
		console.error("Error accepting passenger:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
