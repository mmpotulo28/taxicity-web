import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const tripId = params.id;
		const body = await req.json();
		const { status } = body;

		// Verify user is a driver
		const driver = await prisma.driver.findUnique({
			where: { userId },
			include: { taxis: true },
		});

		if (!driver) {
			return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });
		}

		const taxiIds = driver.taxis.map((t: { id: string }) => t.id);

		// Verify trip belongs to one of driver's taxis
		const trip = await prisma.trip.findUnique({
			where: { id: tripId },
		});

		if (!trip) {
			return NextResponse.json({ error: "Trip not found" }, { status: 404 });
		}

		if (!taxiIds.includes(trip.taxiId)) {
			return NextResponse.json({ error: "Unauthorized for this trip" }, { status: 403 });
		}

		const updateData: {
			status: string;
			pickupTime?: Date;
			dropoffTime?: Date;
			paymentStatus?: "PENDING" | "PAID" | "FAILED";
		} = { status };

		if (status === "ARRIVED_AT_PICKUP") {
			// Maybe log arrival time?
		} else if (status === "IN_PROGRESS") {
			updateData.pickupTime = new Date();
		} else if (status === "COMPLETED") {
			updateData.dropoffTime = new Date();
			updateData.paymentStatus = "PAID"; // Assume cash paid on completion for now
		}

		// Update trip
		const updatedTrip = await prisma.trip.update({
			where: { id: tripId },
			data: updateData,
		});

		return NextResponse.json(updatedTrip);
	} catch (error) {
		console.error("Error updating trip status:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
