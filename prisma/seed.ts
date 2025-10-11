// prisma/seed.ts
// Seed script for TaxiCity database using Prisma
// Run with: npx prisma db seed

import { PrismaClient } from "../lib/prisma/generated";
import { taxis, ranks, routes, trips } from "../lib/data";

const prisma = new PrismaClient();

async function main() {
	// Seed Ranks
	for (const rank of ranks) {
		console.log("Seeding rank:", rank.name);
		await prisma.rank.upsert({
			where: { id: rank.id },
			update: {},
			create: {
				id: rank.id,
				name: rank.name,
				address: rank.address,
				city: "Johannesburg", // Dummy
				province: "Gauteng", // Dummy
				region: rank.region,
				lat: rank.coordinates.lat,
				lng: rank.coordinates.lng,
				phone: rank.phone,
				isActive: true,
			},
		});
	}

	// Seed Routes
	for (const route of routes) {
		console.log("Seeding route:", route.name);
		await prisma.route.upsert({
			where: { id: route.id },
			update: {},
			create: {
				id: route.id,
				name: route.name,
				description: route.name,
				distance: parseFloat(route.distance),
				baseFare: parseFloat(route.estimatedFare.replace(/[^\d.]/g, "")),
				estimatedDuration: parseInt(route.estimatedDuration),
				sourceRankId: route.rankId,
				destRankId: route.destinationRankId,
				status:
					route.status === "active"
						? "ACTIVE"
						: route.status === "busy"
							? "BUSY"
							: "INACTIVE",
			},
		});
	}

	// Seed Drivers (from taxis)
	for (const taxi of taxis) {
		console.log("Seeding driver:", taxi.driver);
		await prisma.driver.upsert({
			where: { phone: taxi.phone || "0000000000" },
			update: {},
			create: {
				firstName: taxi.driver.split(" ")[0],
				lastName: taxi.driver.split(" ").slice(1).join(" ") || "Driver",
				fullName: taxi.driver,
				phone: taxi.phone || "0000000000",
				licenseNumber: `LIC${Math.floor(Math.random() * 100000)}`,
				licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
				status: "ACTIVE",
			},
		});
	}

	// Seed Taxis
	for (const taxi of taxis) {
		// Find driver
		console.log("Seeding taxi:", taxi.licensePlate);
		const driver = await prisma.driver.findUnique({
			where: { phone: taxi.phone || "0000000000" },
		});

		console.log("Found driver:", driver?.fullName);

		const taxiCreate: any = {
			licensePlate: taxi.licensePlate,
			model: taxi.model,
			make: taxi.model.split(" ")[0],
			year: 2022,
			color: "white",
			capacity: taxi.capacity,
			status:
				taxi.status === "available"
					? "AVAILABLE"
					: taxi.status === "busy"
						? "BUSY"
						: taxi.status === "offline"
							? "OFFLINE"
							: "AVAILABLE",
		};

		if (driver?.id) taxiCreate.driverId = driver.id;

		console.log("Creating taxi with data:", taxiCreate);
		await prisma.taxi.upsert({
			where: { licensePlate: taxi.licensePlate },
			update: {},
			create: taxiCreate,
		});
	}

	// Seed Trips (basic, not all relations)
	for (const trip of trips) {
		// Find taxi
		const taxi = await prisma.taxi.findFirst({ where: { licensePlate: trip.licensePlate } });
		const route = await prisma.route.findFirst({ where: { name: trip.route } });
		const rank = await prisma.rank.findFirst({ where: { address: trip.pickup } });

		// Map payment method string to enum
		let paymentMethod: any = "CASH";

		if (trip.paymentMethod) {
			const pm = trip.paymentMethod.toLowerCase();

			if (pm.includes("qr")) paymentMethod = "QR_CODE";
			else if (pm.includes("mobile")) paymentMethod = "MOBILE_MONEY";
			else if (pm.includes("cash")) paymentMethod = "CASH";
		}

		const tripCreate: any = {
			id: trip.id,
			userId: "dummy-user-id", // Replace with real user if available
			pickupAddress: trip.pickup,
			pickupLat: rank?.lat || 0,
			pickupLng: rank?.lng || 0,
			dropoffAddress: trip.dropoff,
			dropoffLat: 0,
			dropoffLng: 0,
			fare: parseFloat(trip.fare.replace(/[^\d.]/g, "")),
			status:
				trip.status === "completed"
					? "COMPLETED"
					: trip.status === "cancelled"
						? "CANCELLED"
						: "IN_PROGRESS",
			paymentMethod,
			paymentStatus: "PAID",
			requestTime: new Date(),
		};
		if (taxi?.id) tripCreate.taxiId = taxi.id;
		if (route?.id) tripCreate.routeId = route.id;
		if (rank?.id) tripCreate.rankId = rank.id;

		await prisma.trip.upsert({
			where: { id: trip.id },
			update: {},
			create: tripCreate,
		});
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
