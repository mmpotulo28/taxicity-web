import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

// Validation schemas
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

// GET /api/drivers/[id] - Get specific driver
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const driver = await prisma.driver.findUnique({
			where: { id: params.id },
			include: {
				taxis: {
					include: {
						currentLocation: true,
						routes: {
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
							where: { isActive: true },
						},
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
						_count: {
							select: {
								trips: true,
							},
						},
					},
				},
				tripRatings: {
					orderBy: { createdAt: "desc" },
					take: 10,
					select: {
						id: true,
						rating: true,
						comment: true,
						createdAt: true,
						trip: {
							select: {
								id: true,
								pickupAddress: true,
								dropoffAddress: true,
								fare: true,
							},
						},
						user: {
							select: {
								id: true,
								fullName: true,
							},
						},
					},
				},
				favoriteOfUsers: {
					select: {
						user: {
							select: {
								id: true,
								fullName: true,
							},
						},
					},
				},
				_count: {
					select: {
						taxis: true,
						tripRatings: true,
						favoriteOfUsers: true,
					},
				},
			},
		});

		if (!driver) {
			return NextResponse.json({ error: "Driver not found" }, { status: 404 });
		}

		// Calculate average rating
		const ratings = driver.tripRatings.map((r: any) => r.rating);
		const averageRating =
			ratings.length > 0
				? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
				: 0;

		return NextResponse.json({
			...driver,
			averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
		});
	} catch (error) {
		console.error("Error fetching driver:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// PUT /api/drivers/[id] - Update driver (admin only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// TODO: Add admin role check here

		const body = await req.json();
		const parsed = UpdateDriverSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid data", details: parsed.error.issues },
				{ status: 400 },
			);
		}

		// Check if driver exists
		const existingDriver = await prisma.driver.findUnique({
			where: { id: params.id },
		});

		if (!existingDriver) {
			return NextResponse.json({ error: "Driver not found" }, { status: 404 });
		}

		// Check for unique constraints if being updated
		if (parsed.data.phone && parsed.data.phone !== existingDriver.phone) {
			const phoneExists = await prisma.driver.findUnique({
				where: { phone: parsed.data.phone },
			});

			if (phoneExists) {
				return NextResponse.json({ error: "Phone number already exists" }, { status: 409 });
			}
		}

		if (parsed.data.email && parsed.data.email !== existingDriver.email) {
			const emailExists = await prisma.driver.findUnique({
				where: { email: parsed.data.email },
			});

			if (emailExists) {
				return NextResponse.json({ error: "Email already exists" }, { status: 409 });
			}
		}

		// Update fullName if first or last name is being updated
		let updateData: any = { ...parsed.data };

		if (parsed.data.firstName || parsed.data.lastName) {
			const firstName = parsed.data.firstName || existingDriver.firstName;
			const lastName = parsed.data.lastName || existingDriver.lastName;

			updateData.fullName = `${firstName} ${lastName}`;
		}

		// Set verification date if status is being changed to ACTIVE
		if (parsed.data.status === "ACTIVE" && existingDriver.status !== "ACTIVE") {
			updateData.verificationDate = new Date();
		}

		const driver = await prisma.driver.update({
			where: { id: params.id },
			data: updateData,
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
				updatedAt: true,
			},
		});

		return NextResponse.json(driver);
	} catch (error) {
		console.error("Error updating driver:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// DELETE /api/drivers/[id] - Delete driver (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// TODO: Add admin role check here

		// Check if driver exists and has taxis or active trips
		const existingDriver = await prisma.driver.findUnique({
			where: { id: params.id },
			include: {
				taxis: {
					include: {
						trips: {
							where: {
								status: {
									in: [
										"REQUESTED",
										"ACCEPTED",
										"ARRIVED_AT_PICKUP",
										"IN_PROGRESS",
									],
								},
							},
						},
					},
				},
			},
		});

		if (!existingDriver) {
			return NextResponse.json({ error: "Driver not found" }, { status: 404 });
		}

		// Check if driver has taxis with active trips
		const hasActiveTrips = existingDriver.taxis.some((taxi: any) => taxi.trips.length > 0);

		if (hasActiveTrips) {
			return NextResponse.json(
				{ error: "Cannot delete driver with active trips" },
				{ status: 400 },
			);
		}

		if (existingDriver.taxis.length > 0) {
			return NextResponse.json(
				{ error: "Cannot delete driver with assigned taxis" },
				{ status: 400 },
			);
		}

		await prisma.driver.delete({
			where: { id: params.id },
		});

		return NextResponse.json({ message: "Driver deleted successfully" });
	} catch (error) {
		console.error("Error deleting driver:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
