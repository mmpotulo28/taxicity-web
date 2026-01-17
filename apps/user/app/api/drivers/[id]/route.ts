import { NextRequest, NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

import { prisma } from "@taxicity/database";

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
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req as any);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const driver = await prisma.driver.findUnique({
			where: { id },
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
						userId: true,
						trip: {
							select: {
								id: true,
								pickupAddress: true,
								dropoffAddress: true,
								fare: true,
							},
						},
					},
				},
				favoriteOfUsers: {
					select: {
						userId: true,
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
		const averageRating = ratings.length > 0 ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length : 0;

		// Fetch user details for ratings and favorites
		const userIds = new Set<string>();
		driver.tripRatings.forEach((r: any) => {
			if (r.userId) userIds.add(r.userId);
		});
		driver.favoriteOfUsers.forEach((f: any) => {
			if (f.userId) userIds.add(f.userId);
		});

		const client = await clerkClient();
		const usersMap = new Map<string, any>();

		if (userIds.size > 0) {
			try {
				const usersList = await client.users.getUserList({ userId: Array.from(userIds) });
				usersList.data.forEach((u) => {
					usersMap.set(u.id, {
						id: u.id,
						fullName: `${u.firstName} ${u.lastName}`,
					});
				});
			} catch (error) {
				console.error("Error fetching users from Clerk:", error);
			}
		}

		const enrichedDriver = {
			...driver,
			tripRatings: driver.tripRatings.map((r) => ({
				...r,
				user: r.userId ? usersMap.get(r.userId) : null,
			})),
			favoriteOfUsers: driver.favoriteOfUsers.map((f) => ({
				...f,
				user: f.userId ? usersMap.get(f.userId) : null,
			})),
			averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
		};

		return NextResponse.json(enrichedDriver);
	} catch (error) {
		console.error("Error fetching driver:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// PUT /api/drivers/[id] - Update driver (admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req as any);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// TODO: Add admin role check here

		const body = await req.json();
		const parsed = UpdateDriverSchema.safeParse(body);

		if (!parsed.success) {
			console.error("Validation error:", parsed.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
		}

		// Check if driver exists
		const existingDriver = await prisma.driver.findUnique({
			where: { id },
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
		const updateData: any = { ...parsed.data };

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
			where: { id },
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
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req as any);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// TODO: Add admin role check here

		// Check if driver exists and has taxis or active trips
		const existingDriver = await prisma.driver.findUnique({
			where: { id },
			include: {
				taxis: {
					include: {
						trips: {
							where: {
								status: {
									in: ["REQUESTED", "ACCEPTED", "ARRIVED_AT_PICKUP", "IN_PROGRESS"],
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
		const hasActiveTrips = (existingDriver as any).taxis.some((taxi: any) => taxi.trips.length > 0);

		if (hasActiveTrips) {
			return NextResponse.json({ error: "Cannot delete driver with active trips" }, { status: 400 });
		}

		if ((existingDriver as any).taxis.length > 0) {
			return NextResponse.json({ error: "Cannot delete driver with assigned taxis" }, { status: 400 });
		}

		await prisma.driver.delete({
			where: { id },
		});

		return NextResponse.json({ message: "Driver deleted successfully" });
	} catch (error) {
		console.error("Error deleting driver:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
