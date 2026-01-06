import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const tripId = (await params).id;

		// Verify user is a driver and get their active taxis/routes
		const driver = await prisma.driver.findUnique({
			where: { userId },
			include: {
				taxis: {
					include: {
						routes: {
							where: { isActive: true },
						},
					},
				},
			},
		});

		if (!driver) {
			return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });
		}

		const trip = await prisma.trip.findUnique({
			where: { id: tripId },
		});

		if (!trip) {
			return NextResponse.json({ error: "Trip not found" }, { status: 404 });
		}

		if (trip.status !== "REQUESTED") {
			return NextResponse.json({ error: "Trip is not in requested state" }, { status: 400 });
		}

		// Find a valid taxi for this trip
		let acceptingTaxiId: string | null = null;

		if (trip.taxiId) {
			// Trip is directly assigned to a taxi
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const isDriverTaxi = driver.taxis.some((t: any) => t.id === trip.taxiId);
			if (!isDriverTaxi) {
				return NextResponse.json({ error: "Unauthorized for this trip" }, { status: 403 });
			}
			acceptingTaxiId = trip.taxiId;
		} else {
			// Trip is broadcast (unassigned)
			// Find a taxi owned by driver that is active on this route
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const eligibleTaxi = driver.taxis.find((t: any) =>
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				t.routes.some((r: any) => r.routeId === trip.routeId),
			);

			if (!eligibleTaxi) {
				return NextResponse.json({ error: "No active vehicle found for this route" }, { status: 403 });
			}
			acceptingTaxiId = eligibleTaxi.id;
		}

		// Update trip
		const updatedTrip = await prisma.trip.update({
			where: { id: tripId },
			data: {
				status: "ACCEPTED",
				acceptTime: new Date(),
				taxiId: acceptingTaxiId,
			},
		});

		return NextResponse.json(updatedTrip);
	} catch (error) {
		console.error("Error accepting trip:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
