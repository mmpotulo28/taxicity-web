import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@taxiciti/database";
import { pusherServer } from "@taxiciti/utils";

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

		// 4. Calculate Platform Fee
		// Logic: 5% standard, 3.5% if >100 vehicle trips in last 30 days
		// Cap at R10.00
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const completedTripsCount = await prisma.vehicleTrip.count({
			where: {
				driverId: vt.driver.id,
				status: "COMPLETED",
				createdAt: { gte: thirtyDaysAgo },
			},
		});

		let feeRate = 0.05; // 5%
		if (completedTripsCount > 100) {
			feeRate = 0.035; // 3.5%
		}

		const fare = Number(passengerTrip.fare);
		const rawFee = fare * feeRate;
		const platformFee = Math.min(rawFee, 10.0);

		// 5. Link Passenger to Vehicle Trip
		const updatedPassengerTrip = await prisma.trip.update({
			where: { id: passengerTripId },
			data: {
				status: "ACCEPTED",
				vehicleTrip: {
					connect: { id: vehicleTrip.id },
				},
				taxi: {
					connect: { id: vehicleTrip.taxiId },
				},
				acceptTime: new Date(),
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				platformFee: platformFee as any,
			},
			include: {
				taxi: {
					include: {
						driver: true,
					},
				},
				route: true,
				vehicleTrip: {
					include: {
						passengers: true,
					},
				},
			},
		});

		// Trigger Pusher event for the specific trip
		try {
			await pusherServer.trigger(`trip-${passengerTripId}`, "trip-updated", updatedPassengerTrip);
			console.log(`Triggered trip-updated for trip-${passengerTripId}`);

			// Notify other drivers to remove the request
			await pusherServer.trigger(`route-${passengerTrip.routeId}`, "trip-cancelled", {
				id: passengerTripId,
				reason: "Request accepted by another driver.",
			});
		} catch (error) {
			console.error("Pusher trigger failed:", error);
		}

		return NextResponse.json(updatedPassengerTrip);
	} catch (error) {
		console.error("Error accepting passenger:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
