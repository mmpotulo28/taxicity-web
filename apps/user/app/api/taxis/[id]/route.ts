import { NextRequest, NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

import { prisma } from "@taxiciti/database";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";

// Validation schemas
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

// GET /api/taxis/[id] - Get specific taxi
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const taxi = await prisma.taxi.findUnique({
			where: { id },
			include: {
				driver: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						fullName: true,
						phone: true,
						email: true,
						profileImage: true,
						status: true,
						licenseNumber: true,
						licenseExpiry: true,
					},
				},
				currentLocation: true,
				locationHistory: {
					orderBy: { createdAt: "desc" },
					take: 10,
				},
				taxiRanks: {
					include: {
						rank: {
							select: {
								id: true,
								name: true,
								address: true,
								lat: true,
								lng: true,
							},
						},
					},
				},
				routes: {
					include: {
						route: {
							select: {
								id: true,
								name: true,
								distance: true,
								baseFare: true,
								estimatedDuration: true,
								sourceRank: {
									select: {
										id: true,
										name: true,
										address: true,
									},
								},
								destRank: {
									select: {
										id: true,
										name: true,
										address: true,
									},
								},
							},
						},
					},
					where: { isActive: true },
				},
				trips: {
					orderBy: { createdAt: "desc" },
					take: 5,
					select: {
						id: true,
						status: true,
						pickupAddress: true,
						dropoffAddress: true,
						fare: true,
						requestTime: true,
						userId: true,
					},
				},
				maintenanceLog: {
					orderBy: { date: "desc" },
					take: 5,
				},
				_count: {
					select: {
						trips: true,
						locationHistory: true,
					},
				},
			},
		});

		if (!taxi) {
			return NextResponse.json({ error: "Taxi not found" }, { status: 404 });
		}

		// Fetch user details for trips
		const userIds = new Set<string>();
		taxi.trips.forEach((t) => {
			if (t.userId) userIds.add(t.userId);
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

		const enrichedTaxi = {
			...taxi,
			trips: taxi.trips.map((t) => ({
				...t,
				user: t.userId ? usersMap.get(t.userId) : null,
			})),
		};

		return NextResponse.json(enrichedTaxi);
	} catch (error) {
		console.error("Error fetching taxi:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// PUT /api/taxis/[id] - Update taxi (admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!(await isAdmin())) {
			return unauthorizedResponse();
		}

		const body = await req.json();
		const parsed = UpdateTaxiSchema.safeParse(body);

		if (!parsed.success) {
			console.error("Validation error:", parsed.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
		}

		// Check if taxi exists
		const existingTaxi = await prisma.taxi.findUnique({
			where: { id },
		});

		if (!existingTaxi) {
			return NextResponse.json({ error: "Taxi not found" }, { status: 404 });
		}

		const taxi = await prisma.taxi.update({
			where: { id },
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
				currentLocation: true,
			},
		});

		return NextResponse.json(taxi);
	} catch (error) {
		console.error("Error updating taxi:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// DELETE /api/taxis/[id] - Delete taxi (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!(await isAdmin())) {
			return unauthorizedResponse();
		}

		// Check if taxi exists and has active trips
		const existingTaxi = await prisma.taxi.findUnique({
			where: { id },
			include: {
				trips: {
					where: {
						status: {
							in: ["REQUESTED", "ACCEPTED", "ARRIVED_AT_PICKUP", "IN_PROGRESS"],
						},
					},
				},
			},
		});

		if (!existingTaxi) {
			return NextResponse.json({ error: "Taxi not found" }, { status: 404 });
		}

		if ((existingTaxi as any).trips.length > 0) {
			return NextResponse.json({ error: "Cannot delete taxi with active trips" }, { status: 400 });
		}

		await prisma.taxi.delete({
			where: { id },
		});

		return NextResponse.json({ message: "Taxi deleted successfully" });
	} catch (error) {
		console.error("Error deleting taxi:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
