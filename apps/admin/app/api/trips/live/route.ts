import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, redis } from "@taxiciti/database";

export async function GET() {
	const { userId } = await auth();

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// Fetch all active trips with vehicle information
		const activeTrips = await prisma.trip.findMany({
			where: {
				status: {
					in: ["REQUESTED", "ACCEPTED", "IN_PROGRESS", "ARRIVED_AT_PICKUP"],
				},
			},
			include: {
				route: {
					include: {
						sourceRank: true,
						destRank: true,
					},
				},
				vehicleTrip: {
					include: {
						taxi: true,
						driver: true,
					},
				},
			},
			orderBy: {
				requestTime: "desc",
			},
		});

		// Fetch current locations from Redis for each vehicle
		const tripsWithLocations = await Promise.all(
			activeTrips.map(async (trip) => {
				let currentLocation = null;

				if (trip.vehicleTrip?.taxiId) {
					const locationData = await redis.get(`vehicle:${trip.vehicleTrip.taxiId}:location`);
					if (locationData) {
						currentLocation = JSON.parse(locationData as string);
					}
				}

				return {
					id: trip.id,
					status: trip.status,
					pickupAddress: trip.pickupAddress,
					dropoffAddress: trip.dropoffAddress,
					pickupLat: trip.pickupLat,
					pickupLng: trip.pickupLng,
					dropoffLat: trip.dropoffLat,
					dropoffLng: trip.dropoffLng,
					fare: trip.fare,
					requestTime: trip.requestTime,
					route: {
						name: trip.route.name,
						sourceRank: trip.route.sourceRank,
						destRank: trip.route.destRank,
					},
					vehicleTrip: trip.vehicleTrip
						? {
								taxiId: trip.vehicleTrip.taxiId,
								driver: {
									fullName: trip.vehicleTrip.driver.fullName,
									firstName: trip.vehicleTrip.driver.firstName,
									lastName: trip.vehicleTrip.driver.lastName,
								},
								taxi: {
									model: trip.vehicleTrip.taxi.model,
									licensePlate: trip.vehicleTrip.taxi.licensePlate,
								},
							}
						: null,
					currentLocation, // Real-time location from Redis
				};
			}),
		);

		return NextResponse.json(tripsWithLocations);
	} catch (error) {
		console.error("Error fetching live trips:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
