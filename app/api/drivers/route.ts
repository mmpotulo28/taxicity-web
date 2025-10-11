import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

// Validation schemas
const CreateDriverSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	phone: z.string().min(1),
	email: z.string().email().optional(),
	profileImage: z.string().optional(),
	licenseNumber: z.string().min(1),
	licenseExpiry: z.string().transform((str) => new Date(str)),
	dateOfBirth: z
		.string()
		.transform((str) => new Date(str))
		.optional(),
	address: z.string().optional(),
});

const UpdateDriverSchema = z.object({
	firstName: z.string().min(1).optional(),
	lastName: z.string().min(1).optional(),
	phone: z.string().min(1).optional(),
	email: z.string().email().optional(),
	profileImage: z.string().optional(),
	licenseExpiry: z
		.string()
		.transform((str) => new Date(str))
		.optional(),
	dateOfBirth: z
		.string()
		.transform((str) => new Date(str))
		.optional(),
	address: z.string().optional(),
	status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]).optional(),
});

// GET /api/drivers - Get all drivers with optional filtering
export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const url = new URL(req.url);
		const status = url.searchParams.get("status");
		const page = parseInt(url.searchParams.get("page") || "1");
		const limit = parseInt(url.searchParams.get("limit") || "20");
		const skip = (page - 1) * limit;

		const where: any = {};

		if (status) {
			where.status = status;
		}

		const [drivers, total] = await Promise.all([
			prisma.driver.findMany({
				where,
				select: {
					id: true,
					firstName: true,
					lastName: true,
					fullName: true,
					phone: true,
					email: true,
					profileImage: true,
					licenseNumber: true,
					licenseExpiry: true,
					status: true,
					verificationDate: true,
					createdAt: true,
					updatedAt: true,
					taxis: {
						select: {
							id: true,
							licensePlate: true,
							model: true,
							make: true,
							status: true,
						},
					},
					_count: {
						select: {
							taxis: true,
							tripRatings: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.driver.count({ where }),
		]);

		return NextResponse.json({
			drivers,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching drivers:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// POST /api/drivers - Create a new driver (admin only)
export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// TODO: Add admin role check here

		const body = await req.json();
		const parsed = CreateDriverSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid data", details: parsed.error.issues },
				{ status: 400 },
			);
		}

		// Check if phone number already exists
		const existingDriver = await prisma.driver.findUnique({
			where: { phone: parsed.data.phone },
		});

		if (existingDriver) {
			return NextResponse.json({ error: "Phone number already exists" }, { status: 409 });
		}

		// Check if license number already exists
		const existingLicense = await prisma.driver.findUnique({
			where: { licenseNumber: parsed.data.licenseNumber },
		});

		if (existingLicense) {
			return NextResponse.json({ error: "License number already exists" }, { status: 409 });
		}

		// Check if email already exists (if provided)
		if (parsed.data.email) {
			const existingEmail = await prisma.driver.findUnique({
				where: { email: parsed.data.email },
			});

			if (existingEmail) {
				return NextResponse.json({ error: "Email already exists" }, { status: 409 });
			}
		}

		const driver = await prisma.driver.create({
			data: {
				...parsed.data,
				fullName: `${parsed.data.firstName} ${parsed.data.lastName}`,
				status: "PENDING_VERIFICATION",
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				fullName: true,
				phone: true,
				email: true,
				profileImage: true,
				licenseNumber: true,
				licenseExpiry: true,
				status: true,
				createdAt: true,
			},
		});

		return NextResponse.json(driver, { status: 201 });
	} catch (error) {
		console.error("Error creating driver:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
