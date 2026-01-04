import { NextRequest, NextResponse } from "next/server";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		const user = await currentUser();

		if (!userId || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const { licenseNumber, licenseExpiry, licenseImageFront, licenseImageBack, plateNumber, model, year, capacity, registrationDoc, insuranceDoc, permitDoc } = body;

		// Basic validation
		if (!licenseNumber || !plateNumber || !model || !licenseImageFront || !licenseImageBack || !registrationDoc || !insuranceDoc || !permitDoc) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		// Check if driver already exists
		const existingDriver = await prisma.driver.findUnique({
			where: { userId },
		});

		if (existingDriver) {
			return NextResponse.json({ error: "Driver application already exists" }, { status: 409 });
		}

		// Create Driver and Taxi
		const driver = await prisma.driver.create({
			data: {
				userId,
				firstName: user.firstName || "Driver",
				lastName: user.lastName || "User",
				email: user.emailAddresses[0]?.emailAddress,
				phone: user.phoneNumbers[0]?.phoneNumber || "",
				licenseNumber,
				licenseExpiry: new Date(licenseExpiry),
				licenseImageFront,
				licenseImageBack,
				status: "PENDING_VERIFICATION",
				taxis: {
					create: {
						plateNumber,
						model,
						year: parseInt(year),
						capacity: parseInt(capacity),
						status: "AVAILABLE",
						registrationDoc,
						insuranceDoc,
						permitDoc,
					},
				},
			},
			include: {
				taxis: true,
			},
		});

		return NextResponse.json(driver);
	} catch (error) {
		console.error("Error submitting driver application:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
