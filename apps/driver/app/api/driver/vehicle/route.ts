import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@taxicity/database";

export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const { plateNumber, model, make, color, seats } = body;

		if (!plateNumber || !model || !make || !color || !seats) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		// Find driver
		const driver = await prisma.driver.findUnique({
			where: { userId },
		});

		if (!driver) {
			return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });
		}

		// Create Taxi
		const taxi = await prisma.taxi.create({
			data: {
				licensePlate: plateNumber,
				model,
				make,
				color,
				capacity: parseInt(seats),
				driverId: driver.id,
				status: "AVAILABLE",
			},
		});

		return NextResponse.json(taxi);
	} catch (error) {
		console.error("Error creating vehicle:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
