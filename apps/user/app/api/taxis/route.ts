import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

import { prisma } from "@taxicity/database";

// Validation schemas
const CreateTaxiSchema = z.object({
	licensePlate: z.string().min(1),
	model: z.string().min(1),
	make: z.string().min(1),
	year: z.number().positive().optional(),
	color: z.string().min(1),
	capacity: z.number().positive(),
	driverId: z.string(),
	registrationDoc: z.string().optional(),
	insuranceDoc: z.string().optional(),
});

const UpdateTaxiSchema = z.object({
	model: z.string().min(1).optional(),
	make: z.string().min(1).optional(),
	year: z.number().positive().optional(),
	color: z.string().min(1).optional(),
	capacity: z.number().positive().optional(),
	status: z.enum(["AVAILABLE", "BUSY", "OFFLINE", "MAINTENANCE"]).optional(),
	registrationDoc: z.string().optional(),
	insuranceDoc: z.string().optional(),
});

const UpdateLocationSchema = z.object({
	lat: z.number(),
	lng: z.number(),
	heading: z.number().optional(),
	speed: z.number().optional(),
});

// GET /api/taxis - Get all taxis with optional filtering
export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const status = url.searchParams.get("status");
		const routeId = url.searchParams.get("routeId");
		const rankId = url.searchParams.get("rankId");
		const driverId = url.searchParams.get("driverId");
		const available = url.searchParams.get("available") === "true";
		const page = parseInt(url.searchParams.get("page") || "1");
		const limit = parseInt(url.searchParams.get("limit") || "20");
		const skip = (page - 1) * limit;

		const where: any = {};

		if (status) {
			where.status = status;
		}

		if (available) {
			where.status = "AVAILABLE";
		}

		if (driverId) {
			where.driverId = driverId;
		}

		// Filter by route
		if (routeId) {
			where.OR = [
				{
					vehicleTrips: {
						some: {
							routeId,
							status: { in: ["BOARDING", "IN_PROGRESS"] },
						},
					},
				},
				{
					routes: {
						some: {
							routeId,
							isActive: true,
						},
					},
				},
			];
		}

		// Filter by rank
		if (rankId) {
			where.taxiRanks = {
				some: {
					rankId,
				},
			};
		}

		const [taxis, total] = await Promise.all([
			prisma.taxi.findMany({
				where,
				include: {
					driver: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							phone: true,
							profileImage: true,
							status: true,
						},
					},
					currentLocation: true,
					taxiRanks: {
						include: {
							rank: {
								select: {
									id: true,
									name: true,
									address: true,
								},
							},
						},
					},
					routes: {
						where: { isActive: true },
						include: {
							route: {
								select: {
									id: true,
									name: true,
									baseFare: true,
									estimatedDuration: true,
								},
							},
						},
					},
					vehicleTrips: {
						where: {
							status: { in: ["BOARDING", "IN_PROGRESS"] },
						},
						include: {
							route: {
								select: {
									id: true,
									name: true,
									baseFare: true,
									estimatedDuration: true,
								},
							},
						},
						take: 1,
					},
					_count: {
						select: {
							trips: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.taxi.count({ where }),
		]);

		const transformedTaxis = taxis.map((taxi) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const activeTrip = (taxi as any).vehicleTrips?.[0];
			if (activeTrip) {
				return {
					...taxi,
					status: "AVAILABLE", // Override status for frontend
					routes: [
						{
							routeId: activeTrip.routeId,
							isActive: true,
							route: activeTrip.route,
						},
					],
				};
			}
			return taxi;
		});

		return NextResponse.json({
			taxis: transformedTaxis,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching taxis:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

import { isAdmin, unauthorizedResponse } from "@/lib/auth";

// POST /api/taxis - Create a new taxi (admin only)
export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const isUserAdmin = await isAdmin();
		if (!isUserAdmin) {
			return unauthorizedResponse();
		}

		const body = await req.json();
		const parsed = CreateTaxiSchema.safeParse(body);

		if (!parsed.success) {
			console.error("Validation error:", parsed.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
		}

		// Verify driver exists and is active
		const driver = await prisma.driver.findUnique({
			where: { id: parsed.data.driverId },
		});

		if (!driver) {
			return NextResponse.json({ error: "Driver not found" }, { status: 404 });
		}

		if (driver.status !== "ACTIVE") {
			return NextResponse.json({ error: "Driver is not active" }, { status: 400 });
		}

		// Check if license plate already exists
		const existingTaxi = await prisma.taxi.findUnique({
			where: { licensePlate: parsed.data.licensePlate },
		});

		if (existingTaxi) {
			return NextResponse.json({ error: "License plate already exists" }, { status: 409 });
		}

		const taxi = await prisma.taxi.create({
			data: parsed.data,
			include: {
				driver: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						phone: true,
						profileImage: true,
					},
				},
			},
		});

		return NextResponse.json(taxi, { status: 201 });
	} catch (error) {
		console.error("Error creating taxi:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
