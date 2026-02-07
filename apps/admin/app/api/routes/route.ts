import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxiciti/database";
import { auth } from "@clerk/nextjs/server";

export async function GET(_req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const routes = await prisma.route.findMany({
			include: {
				sourceRank: true,
				destRank: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(routes);
	} catch (error) {
		console.error("Error fetching routes:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const {
			name,
			description,
			sourceRankId,
			destRankId,
			baseFare,
			popularLocations = [], // Array of { name, address, lat, lng, type }
		} = body;

		if (!sourceRankId || !destRankId || !baseFare || !name) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		// Fetch ranks
		const sourceRank = await prisma.rank.findUnique({ where: { id: sourceRankId } });
		const destRank = await prisma.rank.findUnique({ where: { id: destRankId } });

		if (!sourceRank || !destRank) {
			return NextResponse.json({ error: "Invalid ranks" }, { status: 400 });
		}

		// Get Google Route
		let polylineString = null;
		let distanceVal = 0; // km
		let durationVal = 0; // mins

		const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

		if (apiKey) {
			const origin = `${sourceRank.lat},${sourceRank.lng}`;
			const destination = `${destRank.lat},${destRank.lng}`;

			// Construct waypoints string
			let waypointsStr = "";
			if (popularLocations.length > 0) {
				const stops = popularLocations.map((loc: any) => `${loc.lat},${loc.lng}`).join("|");
				// Use driving mode and default order (since taxi routes are often fixed)
				waypointsStr = stops;
			}

			const googleUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}${waypointsStr ? `&waypoints=${waypointsStr}` : ""}&mode=driving`;

			try {
				const googleRes = await fetch(googleUrl);
				const googleData = await googleRes.json();

				if (googleData.status === "OK" && googleData.routes.length > 0) {
					const route = googleData.routes[0];
					polylineString = route.overview_polyline.points;

					// Sum legs for distance/duration
					let totalMeters = 0;
					let totalSeconds = 0;
					for (const leg of route.legs) {
						totalMeters += leg.distance.value;
						totalSeconds += leg.duration.value;
					}

					distanceVal = totalMeters / 1000;
					durationVal = Math.ceil(totalSeconds / 60);
				} else {
					console.warn("Google Maps API returned no routes or error:", googleData.status, googleData.error_message);
				}
			} catch (err) {
				console.error("Google Maps API fetch error:", err);
			}
		}

		// Fallbacks
		if (!distanceVal) distanceVal = parseFloat(body.distance) || 0;
		if (!durationVal) durationVal = parseInt(body.estimatedDuration) || 0;

		const newRoute = await prisma.route.create({
			data: {
				name,
				description,
				sourceRankId,
				destRankId,
				baseFare: Number(baseFare),
				distance: distanceVal,
				estimatedDuration: durationVal,
				polyline: polylineString,
				popularLocations: {
					create: popularLocations.map((loc: any) => ({
						name: loc.name,
						address: loc.address || loc.name,
						lat: loc.lat,
						lng: loc.lng,
						type: loc.type || "STOP",
					})),
				},
			},
			include: {
				popularLocations: true,
				sourceRank: true,
				destRank: true,
			},
		});

		return NextResponse.json(newRoute);
	} catch (error) {
		console.error("Error creating route:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
