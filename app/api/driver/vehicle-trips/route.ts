import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const CreateVehicleTripSchema = z.object({
	taxiId: z.string(),
	routeId: z.string(),
});

// GET /api/driver/vehicle-trips - List active vehicle trips for driver
export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const driver = await prisma.driver.findUnique({
			where: { userId },
		});

		if (!driver) {
			return NextResponse.json({ error: "Driver not found" }, { status: 404 });
		}

		const trips = await prisma.vehicleTrip.findMany({
			where: {
				driverId: driver.id,
				status: { in: ["SCHEDULED", "BOARDING", "IN_PROGRESS"] },
			},
			include: {
				route: true,
				taxi: true,
				passengers: {
					where: { status: { in: ["ACCEPTED", "ARRIVED_AT_PICKUP", "IN_PROGRESS"] } },
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json(trips);
	} catch (error) {
		console.error("Error fetching vehicle trips:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

// POST /api/driver/vehicle-trips - Create a new vehicle trip (Start a run)
export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const body = await req.json();
		const parse = CreateVehicleTripSchema.safeParse(body);

		if (!parse.success) {
			return NextResponse.json({ error: "Invalid data", details: parse.error.issues }, { status: 400 });
		}

		const driver = await prisma.driver.findUnique({
			where: { userId },
		});

		if (!driver) {
			return NextResponse.json({ error: "Driver not found" }, { status: 404 });
		}

		const taxi = await prisma.taxi.findUnique({
			where: { id: parse.data.taxiId },
		});

		if (!taxi) {
			return NextResponse.json({ error: "Taxi not found" }, { status: 404 });
		}

		// Check if there's already an active trip for this taxi
		const activeTrip = await prisma.vehicleTrip.findFirst({
			where: {
				taxiId: parse.data.taxiId,
				status: { in: ["BOARDING", "IN_PROGRESS"] },
			},
		});

		if (activeTrip) {
			return NextResponse.json({ error: "Taxi already has an active trip" }, { status: 409 });
		}

		const vehicleTrip = await prisma.vehicleTrip.create({
			data: {
				driverId: driver.id,
				taxiId: parse.data.taxiId,
				routeId: parse.data.routeId,
				capacity: taxi.capacity,
				status: "BOARDING",
				startTime: new Date(),
			},
			include: {
				route: true,
				taxi: true,
				passengers: true,
			},
		});

		return NextResponse.json(vehicleTrip, { status: 201 });
	} catch (error) {
		console.error("Error creating vehicle trip:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
