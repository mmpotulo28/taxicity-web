// prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// --- Data from lib/data.ts ---

const ranks = [
	{
		id: "rank1",
		name: "Johannesburg CBD Rank",
		coordinates: {
			lat: -26.2041,
			lng: 28.0473,
		},
		address: "Bree Street, Johannesburg CBD",
		phone: "011 555 1234",
		region: "Gauteng",
	},
	{
		id: "rank2",
		name: "Sandton Rank",
		coordinates: {
			lat: -26.1052,
			lng: 28.0568,
		},
		address: "Rivonia Road, Sandton",
		phone: "011 555 5678",
		region: "Gauteng",
	},
	{
		id: "rank3",
		name: "Pretoria Central Rank",
		coordinates: {
			lat: -25.7479,
			lng: 28.2293,
		},
		address: "Bosman Street, Pretoria Central",
		phone: "012 555 9012",
		region: "Gauteng",
	},
	{
		id: "rank4",
		name: "Soweto Rank",
		coordinates: {
			lat: -26.2686,
			lng: 27.8582,
		},
		address: "Old Potchefstroom Road, Soweto",
		phone: "011 555 3456",
		region: "Gauteng",
	},
	{
		id: "rank5",
		name: "Durban Central Rank",
		coordinates: {
			lat: -29.8587,
			lng: 31.0218,
		},
		address: "Warwick Avenue, Durban Central",
		phone: "031 555 7890",
		region: "KwaZulu-Natal",
	},
];

const routes = [
	{
		id: "route1",
		name: "Johannesburg CBD to Sandton",
		rankId: "rank1",
		destinationRankId: "rank2",
		estimatedDuration: "30-40 min",
		estimatedFare: "R25.00",
		distance: "14.7 km",
		status: "active",
		popularLocations: [
			{
				name: "Rosebank Mall",
				address: "50 Bath Ave, Rosebank, Johannesburg, 2196",
				lat: -26.1463,
				lng: 28.0419,
				type: "MALL",
			},
			{
				name: "Killarney Mall",
				address: "60 Riviera Rd, Killarney, Johannesburg, 2193",
				lat: -26.1635,
				lng: 28.0512,
				type: "MALL",
			},
		],
	},
	{
		id: "route2",
		name: "Johannesburg CBD to Pretoria",
		rankId: "rank1",
		destinationRankId: "rank3",
		estimatedDuration: "45-60 min",
		estimatedFare: "R65.00",
		distance: "57.8 km",
		status: "active",
		popularLocations: [
			{
				name: "Menlyn Park",
				address: "Atterbury Rd & Lois Ave, Menlyn Park, Pretoria, 0063",
				lat: -25.7829,
				lng: 28.2756,
				type: "MALL",
			},
			{
				name: "UNISA",
				address: "Preller St, Muckleneuk, Pretoria, 0002",
				lat: -25.7667,
				lng: 28.1956,
				type: "UNIVERSITY",
			},
		],
	},
	{
		id: "route3",
		name: "Johannesburg CBD to Soweto",
		rankId: "rank1",
		destinationRankId: "rank4",
		estimatedDuration: "35-45 min",
		estimatedFare: "R20.00",
		distance: "23.5 km",
		status: "active",
		popularLocations: [
			{
				name: "Maponya Mall",
				address: "2127 Chris Hani Rd, Klipspruit, Soweto, 1809",
				lat: -26.2589,
				lng: 27.9083,
				type: "MALL",
			},
			{
				name: "Bara Hospital",
				address: "26 Chris Hani Rd, Diepkloof Zone 6, Soweto, 1862",
				lat: -26.2608,
				lng: 27.9496,
				type: "HOSPITAL",
			},
		],
	},
	{
		id: "route4",
		name: "Sandton to Pretoria",
		rankId: "rank2",
		destinationRankId: "rank3",
		estimatedDuration: "40-50 min",
		estimatedFare: "R45.00",
		distance: "42.1 km",
		status: "busy",
	},
	{
		id: "route5",
		name: "Pretoria to Johannesburg",
		rankId: "rank3",
		destinationRankId: "rank1",
		estimatedDuration: "45-60 min",
		estimatedFare: "R65.00",
		distance: "57.8 km",
		status: "active",
	},
];

const taxis = [
	{
		id: "taxi1",
		driver: "Sipho Nkosi",
		model: "Toyota Quantum",
		licensePlate: "GP 123-456",
		capacity: 15,
		rating: 4.8,
		status: "available",
		location: {
			lat: -26.2051,
			lng: 28.0483,
		},
		eta: "5 min",
		routeId: "route1",
		phone: "073 123 4567",
	},
	{
		id: "taxi2",
		driver: "Thabo Molefe",
		model: "Toyota Hiace",
		licensePlate: "GP 789-012",
		capacity: 15,
		rating: 4.5,
		status: "available",
		location: {
			lat: -26.2031,
			lng: 28.0453,
		},
		eta: "3 min",
		routeId: "route1",
		phone: "082 345 6789",
	},
	{
		id: "taxi3",
		driver: "Mandla Zulu",
		model: "Nissan Impendulo",
		licensePlate: "GP 345-678",
		capacity: 16,
		rating: 4.7,
		status: "busy",
		location: {
			lat: -26.1062,
			lng: 28.0578,
		},
		routeId: "route2",
		phone: "076 567 8901",
	},
	{
		id: "taxi4",
		driver: "Themba Ndlovu",
		model: "Toyota Quantum",
		licensePlate: "GP 901-234",
		capacity: 15,
		rating: 4.9,
		status: "available",
		location: {
			lat: -26.2696,
			lng: 27.8592,
		},
		eta: "7 min",
		routeId: "route3",
		phone: "071 890 1234",
	},
	{
		id: "taxi5",
		driver: "David Mkhize",
		model: "Mercedes-Benz Sprinter",
		licensePlate: "GP 567-890",
		capacity: 22,
		rating: 4.6,
		status: "offline",
		routeId: "route4",
		phone: "084 012 3456",
	},
];

const trips = [
	{
		id: "trip1",
		route: "Johannesburg CBD to Sandton",
		date: "2023-11-15",
		time: "08:30 AM",
		pickup: "Bree Street, Johannesburg CBD",
		dropoff: "Rivonia Road, Sandton",
		driver: "Sipho Nkosi",
		vehicle: "Toyota Quantum",
		licensePlate: "GP 123-456",
		fare: "R25.00",
		status: "completed",
		paymentMethod: "Cash",
		rating: 5,
	},
	{
		id: "trip2",
		route: "Sandton to Pretoria",
		date: "2023-11-10",
		time: "14:15 PM",
		pickup: "Rivonia Road, Sandton",
		dropoff: "Bosman Street, Pretoria Central",
		driver: "Thabo Molefe",
		vehicle: "Toyota Hiace",
		licensePlate: "GP 789-012",
		fare: "R45.00",
		status: "completed",
		paymentMethod: "QR Code",
		rating: 4,
	},
	{
		id: "trip3",
		route: "Johannesburg CBD to Soweto",
		date: "2023-11-05",
		time: "17:45 PM",
		pickup: "Bree Street, Johannesburg CBD",
		dropoff: "Old Potchefstroom Road, Soweto",
		driver: "Mandla Zulu",
		vehicle: "Nissan Impendulo",
		licensePlate: "GP 345-678",
		fare: "R20.00",
		status: "completed",
		paymentMethod: "Cash",
	},
	{
		id: "trip4",
		route: "Pretoria to Johannesburg",
		date: "2023-10-28",
		time: "09:00 AM",
		pickup: "Bosman Street, Pretoria Central",
		dropoff: "Bree Street, Johannesburg CBD",
		driver: "Themba Ndlovu",
		vehicle: "Toyota Quantum",
		licensePlate: "GP 901-234",
		fare: "R65.00",
		status: "cancelled",
		paymentMethod: "N/A",
	},
	{
		id: "trip5",
		route: "Johannesburg CBD to Sandton",
		date: "2023-10-20",
		time: "16:30 PM",
		pickup: "Bree Street, Johannesburg CBD",
		dropoff: "Rivonia Road, Sandton",
		driver: "David Mkhize",
		vehicle: "Mercedes-Benz Sprinter",
		licensePlate: "GP 567-890",
		fare: "R25.00",
		status: "completed",
		paymentMethod: "QR Code",
		rating: 5,
	},
];

// --- End Data ---

async function main() {
	console.log("Start seeding ...");

	// 1. Seed User (Mock ID for Clerk)
	const userId = "user-123";
	console.log(`Using mock user ID: ${userId}`);

	// 2. Seed Ranks
	for (const rank of ranks) {
		await prisma.rank.upsert({
			where: { id: rank.id },
			update: {},
			create: {
				id: rank.id,
				name: rank.name,
				address: rank.address,
				city: "Johannesburg", // Default
				province: rank.region,
				region: rank.region,
				lat: rank.coordinates.lat,
				lng: rank.coordinates.lng,
				phone: rank.phone,
				isActive: true,
			},
		});
	}
	console.log(`Seeded ${ranks.length} ranks`);

	// 3. Seed Routes
	for (const route of routes) {
		const { popularLocations, ...routeData } = route;
		await prisma.route.upsert({
			where: { id: route.id },
			update: {},
			create: {
				id: route.id,
				name: route.name,
				description: route.name,
				distance: parseFloat(route.distance.replace(" km", "")),
				baseFare: parseFloat(route.estimatedFare.replace("R", "")),
				estimatedDuration: parseInt(route.estimatedDuration.split("-")[0]), // Take lower bound
				sourceRankId: route.rankId,
				destRankId: route.destinationRankId,
				status: route.status === "active" ? "ACTIVE" : "INACTIVE",
				popularLocations: {
					create: popularLocations,
				},
			},
		});
	}
	console.log(`Seeded ${routes.length} routes`);

	// 4. Seed Drivers
	for (const taxi of taxis) {
		const phone = taxi.phone || `07${Math.floor(Math.random() * 100000000)}`;
		await prisma.driver.upsert({
			where: { phone },
			update: {},
			create: {
				firstName: taxi.driver.split(" ")[0],
				lastName: taxi.driver.split(" ").slice(1).join(" ") || "Driver",
				fullName: taxi.driver,
				phone: phone,
				licenseNumber: `LIC-${Math.random().toString(36).substring(7).toUpperCase()}`,
				licenseExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
				status: "ACTIVE",
			},
		});
	}
	console.log(`Seeded drivers from taxis`);

	// 5. Seed Taxis
	for (const taxi of taxis) {
		const phone = taxi.phone || `07${Math.floor(Math.random() * 100000000)}`;
		const driver = await prisma.driver.findUnique({ where: { phone } });

		if (!driver) continue;

		await prisma.taxi.upsert({
			where: { licensePlate: taxi.licensePlate },
			update: {
				// Update location if it exists
				currentLocation: taxi.location
					? {
							upsert: {
								create: {
									lat: taxi.location.lat,
									lng: taxi.location.lng,
								},
								update: {
									lat: taxi.location.lat,
									lng: taxi.location.lng,
								},
							},
						}
					: undefined,
			},
			create: {
				id: taxi.id,
				licensePlate: taxi.licensePlate,
				model: taxi.model,
				make: taxi.model.split(" ")[0],
				year: 2023,
				color: "White",
				capacity: taxi.capacity,
				status: taxi.status === "available" ? "AVAILABLE" : taxi.status === "busy" ? "BUSY" : "OFFLINE",
				driverId: driver.id,
				currentLocation: taxi.location
					? {
							create: {
								lat: taxi.location.lat,
								lng: taxi.location.lng,
							},
						}
					: undefined,
			},
		});

		// Link taxi to route
		if (taxi.routeId) {
			await prisma.taxiOnRoute.upsert({
				where: {
					taxiId_routeId: {
						taxiId: taxi.id,
						routeId: taxi.routeId,
					},
				},
				update: {},
				create: {
					taxiId: taxi.id,
					routeId: taxi.routeId,
					isActive: true,
				},
			});
		}
	}
	console.log(`Seeded ${taxis.length} taxis`);

	// 6. Seed Trips
	for (const trip of trips) {
		// Find related entities
		const route = await prisma.route.findFirst({ where: { name: trip.route } });
		const taxi = await prisma.taxi.findFirst({ where: { licensePlate: trip.licensePlate } });

		if (!route || !taxi) {
			console.log(`Skipping trip ${trip.id}: Route or Taxi not found`);
			continue;
		}

		const statusMap: any = {
			completed: "COMPLETED",
			cancelled: "CANCELLED",
			"in-progress": "IN_PROGRESS",
		};

		const paymentMethodMap: any = {
			Cash: "CASH",
			"QR Code": "QR_CODE",
			"N/A": "CASH",
		};

		await prisma.trip.upsert({
			where: { id: trip.id },
			update: {},
			create: {
				id: trip.id,
				userId: userId,
				taxiId: taxi.id,
				routeId: route.id,
				rankId: route.sourceRankId, // Assuming pickup at source rank for simplicity
				pickupAddress: trip.pickup,
				pickupLat: -26.2041, // Dummy coords
				pickupLng: 28.0473,
				dropoffAddress: trip.dropoff,
				dropoffLat: -26.1052,
				dropoffLng: 28.0568,
				fare: parseFloat(trip.fare.replace("R", "")),
				status: statusMap[trip.status] || "COMPLETED",
				paymentMethod: paymentMethodMap[trip.paymentMethod] || "CASH",
				paymentStatus: trip.status === "completed" ? "PAID" : "PENDING",
				requestTime: new Date(`${trip.date}T${trip.time.replace(" AM", "").replace(" PM", "")}:00`),
			},
		});
	}
	console.log(`Seeded ${trips.length} trips`);

	console.log("Seeding finished.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
