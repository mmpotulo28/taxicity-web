import { NextRequest, NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@taxiciti/database";
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
				route: {
					include: {
						popularLocations: {
							orderBy: { createdAt: "asc" }, // Assuming creation order implies route order, or add an 'order' field
						},
					},
				},
				taxi: true,
				passengers: {
					where: { status: { in: ["ACCEPTED", "ARRIVED_AT_PICKUP", "IN_PROGRESS"] } },
				},
			},
			orderBy: { createdAt: "desc" },
		});

		// Fetch user details for passengers
		const client = await clerkClient();
		const userIds = new Set<string>();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		trips.forEach((t: any) => t.passengers.forEach((p: any) => userIds.add(p.userId)));

		const usersMap = new Map();
		if (userIds.size > 0) {
			try {
				const usersList = await client.users.getUserList({ userId: Array.from(userIds) });
				usersList.data.forEach((u) => {
					usersMap.set(u.id, {
						firstName: u.firstName,
						lastName: u.lastName,
						profileImage: u.imageUrl,
					});
				});
			} catch (e) {
				console.error("Failed to fetch users", e);
			}
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const tripsWithUsers = trips.map((t: any) => ({
			...t,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			passengers: t.passengers.map((p: any) => ({
				...p,
				user: usersMap.get(p.userId) || { firstName: "Passenger", lastName: "" },
			})),
		}));

		return NextResponse.json(tripsWithUsers);
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

		// Cleanup: Remove from any queue if exists
		await prisma.rankQueueEntry.deleteMany({
			where: { driverId: driver.id },
		});

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
