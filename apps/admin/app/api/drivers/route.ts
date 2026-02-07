import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxiciti/database";
import { auth } from "@clerk/nextjs/server";

export async function GET(_req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const drivers = await prisma.driver.findMany({
			include: {
				taxis: true,
				_count: {
					select: {
						vehicleTrips: true,
						reports: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(drivers);
	} catch (error) {
		console.error("Error fetching drivers:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const { firstName, lastName, phone, licenseNumber, licenseExpiry, email } = body;

		// Basic validation
		if (!firstName || !lastName || !phone || !licenseNumber || !licenseExpiry) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		const newDriver = await prisma.driver.create({
			data: {
				firstName,
				lastName,
				phone,
				email,
				// password: password || "password123", // Removed as per schema
				licenseNumber,
				licenseExpiry: new Date(licenseExpiry),
				status: "ACTIVE",
			},
		});

		return NextResponse.json(newDriver, { status: 201 });
	} catch (error) {
		console.error("Error creating driver:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
