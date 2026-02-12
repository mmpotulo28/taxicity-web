import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@taxiciti/database";
import { ratelimit } from "@/lib/ratelimit";
import { CHANNELS, EVENTS, pusherServer } from "@taxiciti/utils";

const CreateTripSchema = z.object({
	routeId: z.string(),
	taxiId: z.string().optional(),
	rankId: z.string(),
	pickupAddress: z.string(),
	pickupLat: z.number(),
	pickupLng: z.number(),
	dropoffAddress: z.string(),
	dropoffLat: z.number(),
	dropoffLng: z.number(),
	fare: z.number().positive(),
	paymentMethod: z.enum(["CASH", "QR_CODE", "MOBILE_MONEY"]).default("CASH"),
});

// GET /api/trips - List user's trips
export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const trips = await prisma.trip.findMany({
			where: { userId },
			orderBy: { requestTime: "desc" },
			include: {
				route: true,
				taxi: {
					include: {
						driver: true,
					},
				},
				rank: true,
			},
		});
		return NextResponse.json(trips);
	} catch (error) {
		console.error("Error fetching trips:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

// POST /api/trips - Request a ride
export async function POST(req: NextRequest) {
	const { userId } = getAuth(req as any);
	if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	// Rate Limiting
	const { success } = await ratelimit.limit(userId);
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	try {
		const body = await req.json();
		const parse = CreateTripSchema.safeParse(body);

		if (!parse.success) {
			console.error("Validation error:", parse.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parse.error.issues }, { status: 400 });
		}

		console.log(`[Trip Request] User ${userId} creating trip`);

		const tripData: any = {
			routeId: parse.data.routeId,
			rankId: parse.data.rankId,
			pickupAddress: parse.data.pickupAddress,
			pickupLat: parse.data.pickupLat,
			pickupLng: parse.data.pickupLng,
			dropoffAddress: parse.data.dropoffAddress,
			dropoffLat: parse.data.dropoffLat,
			dropoffLng: parse.data.dropoffLng,
			fare: parse.data.fare,
			paymentMethod: parse.data.paymentMethod,
			userId,
			status: "REQUESTED",
			paymentStatus: "PENDING",
			taxiId: parse.data.taxiId || null,
		};

		const trip = await prisma.trip.create({
			data: tripData,
			include: {
				route: true,
			},
		});

		// Trigger Pusher event for drivers on this route
		try {
			// Broadcast to drivers on the specific route
			await pusherServer.trigger(CHANNELS.ROUTE(trip.routeId), EVENTS.NEW_RIDE_REQUEST, trip);

			// Also broadcast to global driver channel as fallback (optional, but good for MVP)
			// await pusherServer.trigger(CHANNELS.DRIVER, EVENTS.NEW_RIDE_REQUEST, trip);
		} catch (error) {
			console.error("Pusher trigger failed:", error);
		}

		return NextResponse.json(trip, { status: 201 });
	} catch (error) {
		console.error("Error creating trip:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
