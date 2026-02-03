import { NextRequest, NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@taxiciti/database";

export async function GET(req: NextRequest) {
	const { userId } = getAuth(req);
	if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		// 1. Find the driver
		const driver = await prisma.driver.findUnique({
			where: { userId },
		});

		if (!driver) {
			return NextResponse.json({ error: "Driver not found" }, { status: 404 });
		}

		// 2. Find active vehicle trip
		const activeTrip = await prisma.vehicleTrip.findFirst({
			where: {
				driverId: driver.id,
				status: { in: ["BOARDING", "IN_PROGRESS"] },
			},
			include: {
				route: true,
			},
		});

		if (!activeTrip) {
			// No active trip, so no requests relevant to current shift
			return NextResponse.json([]);
		}

		// 2. Find requested trips on this route
		const requests = await prisma.trip.findMany({
			where: {
				status: "REQUESTED",
				routeId: activeTrip.routeId,
			},
			orderBy: {
				requestTime: "asc",
			},
			include: {
				route: true,
			},
		});

		// 3. Fetch user details from Clerk
		const client = await clerkClient();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const userIds = Array.from(new Set(requests.map((r: any) => r.userId))) as string[];

		const usersMap = new Map();
		if (userIds.length > 0) {
			try {
				const usersList = await client.users.getUserList({ userId: userIds });
				usersList.data.forEach((u) => {
					usersMap.set(u.id, {
						firstName: u.firstName,
						lastName: u.lastName,
						rating: 5.0, // Placeholder as rating is not in Clerk
					});
				});
			} catch (err) {
				console.error("Failed to fetch users from Clerk:", err);
			}
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const requestsWithUser = requests.map((req: any) => ({
			...req,
			user: usersMap.get(req.userId) || { firstName: "Unknown", lastName: "User", rating: 0 },
		}));

		return NextResponse.json(requestsWithUser);
	} catch (error) {
		console.error("Error fetching requests:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
