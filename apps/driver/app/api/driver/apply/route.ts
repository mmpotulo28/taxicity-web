import { NextRequest, NextResponse } from "next/server";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@taxyciti/database";
import { z } from "zod";

const DriverApplicationSchema = z.object({
	licenseNumber: z.string().min(1, "License number is required"),
	licenseExpiry: z.string().refine((date) => !isNaN(Date.parse(date)), {
		message: "Invalid license expiry date",
	}),
	licenseImageFront: z.string().url("Invalid license front image URL"),
	licenseImageBack: z.string().url("Invalid license back image URL"),
	plateNumber: z.string().min(1, "Plate number is required"),
	make: z.string().min(1, "Vehicle make is required"),
	model: z.string().min(1, "Vehicle model is required"),
	year: z.union([z.string(), z.number()]).transform((val) => Number(val)),
	color: z.string().min(1, "Vehicle color is required"),
	capacity: z.union([z.string(), z.number()]).transform((val) => Number(val)),
	registrationDoc: z.string().url("Invalid registration document URL"),
	insuranceDoc: z.string().url("Invalid insurance document URL"),
	permitDoc: z.string().url("Invalid permit document URL"),
	routeId: z.string().min(1, "Route selection is required"),
});

export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		const user = await currentUser();

		if (!userId || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();

		const validationResult = DriverApplicationSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json({ error: "Validation Error", details: validationResult.error.flatten() }, { status: 400 });
		}

		const { licenseNumber, licenseExpiry, licenseImageFront, licenseImageBack, plateNumber, make, model, year, color, capacity, registrationDoc, insuranceDoc, permitDoc, routeId } = validationResult.data;

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
						licensePlate: plateNumber,
						make,
						model,
						year,
						color,
						capacity,
						status: "AVAILABLE",
						registrationDoc,
						insuranceDoc,
						permitDoc,
						routes: {
							create: {
								routeId,
								isActive: true,
							},
						},
					},
				},
			},
			include: {
				taxis: {
					include: {
						routes: true,
					},
				},
			},
		});

		return NextResponse.json(driver);
	} catch (error) {
		console.error("Error submitting driver application:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
