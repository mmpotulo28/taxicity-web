import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const tripId = params.id;

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

		if (trip.status !== "REQUESTED") {
			return NextResponse.json({ error: "Trip is not in requested state" }, { status: 400 });
		}

		// Update trip
		const updatedTrip = await prisma.trip.update({
			where: { id: tripId },
			data: {
				status: "ACCEPTED",
				acceptTime: new Date(),
			},
		});

		return NextResponse.json(updatedTrip);
	} catch (error) {
		console.error("Error accepting trip:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
