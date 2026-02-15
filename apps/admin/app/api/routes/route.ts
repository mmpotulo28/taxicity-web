import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@taxiciti/database";
import { auth } from "@clerk/nextjs/server";

// Schema for creating a new route
const createRouteSchema = z.object({
	name: z.string().min(1, "Route name is required"),
	description: z.string().optional(),
	sourceRankId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid source rank ID"),
	destRankId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid destination rank ID"),
	baseFare: z.number().positive("Base fare must be positive"),
	distance: z.number().positive().optional(),
	estimatedDuration: z.number().int().positive().optional(),
	popularLocations: z
		.array(
			z.object({
				name: z.string(),
				address: z.string().optional(),
				lat: z.number(),
				lng: z.number(),
				type: z.string().optional(),
			}),
		)
		.optional()
		.default([]),
});

// Helper function to fetch Google Maps directions
async function fetchGoogleDirections(sourceRank: { lat: number; lng: number }, destRank: { lat: number; lng: number }, popularLocations: Array<{ lat: number; lng: number }>): Promise<{ polyline: string | null; distance: number; duration: number }> {
	const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

	if (!apiKey) {
		return { polyline: null, distance: 0, duration: 0 };
	}

	const origin = `${sourceRank.lat},${sourceRank.lng}`;
	const destination = `${destRank.lat},${destRank.lng}`;

	// Construct waypoints string
	let waypointsStr = "";
	if (popularLocations.length > 0) {
		const stops = popularLocations.map((loc) => `${loc.lat},${loc.lng}`).join("|");
		waypointsStr = stops;
	}

	const waypointsParam = waypointsStr ? `&waypoints=${waypointsStr}` : "";
	const googleUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}${waypointsParam}&mode=driving`;

	try {
		const googleRes = await fetch(googleUrl);
		const googleData = await googleRes.json();

		if (googleData.status === "OK" && googleData.routes.length > 0) {
			const route = googleData.routes[0];
			const polylineString = route.overview_polyline.points;

			// Sum legs for distance/duration
			let totalMeters = 0;
			let totalSeconds = 0;
			for (const leg of route.legs) {
				totalMeters += leg.distance.value;
				totalSeconds += leg.duration.value;
			}

			return {
				polyline: polylineString,
				distance: totalMeters / 1000,
				duration: Math.ceil(totalSeconds / 60),
			};
		} else {
			console.warn("Google Maps API returned no routes or error:", googleData.status, googleData.error_message);
		}
	} catch (err) {
		console.error("Google Maps API fetch error:", err);
	}

	return { polyline: null, distance: 0, duration: 0 };
}

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

		// Validate request body with Zod
		const validation = createRouteSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json({ error: "Validation failed", details: validation.error.issues }, { status: 400 });
		}

		const { name, description, sourceRankId, destRankId, baseFare, popularLocations = [] } = validation.data;

		// Fetch ranks
		const sourceRank = await prisma.rank.findUnique({ where: { id: sourceRankId } });
		const destRank = await prisma.rank.findUnique({ where: { id: destRankId } });

		if (!sourceRank || !destRank) {
			return NextResponse.json({ error: "Invalid ranks" }, { status: 400 });
		}

		// Fetch route data from Google Maps
		const { polyline: polylineString, distance: distanceVal, duration: durationVal } = await fetchGoogleDirections(sourceRank, destRank, popularLocations);

		// Use validated data from request as fallback
		const finalDistance = distanceVal || validation.data.distance || 0;
		const finalDuration = durationVal || validation.data.estimatedDuration || 0;

		const newRoute = await prisma.route.create({
			data: {
				name,
				description,
				sourceRankId,
				destRankId,
				baseFare: Number(baseFare),
				distance: finalDistance,
				estimatedDuration: finalDuration,
				polyline: polylineString,
				popularLocations: {
					create: popularLocations.map((loc) => ({
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
