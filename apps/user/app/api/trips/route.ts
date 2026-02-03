import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@taxiciti/database";
import { pusherServer } from "@taxiciti/utils";

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

export async function GET(req: NextRequest) {
	const { userId } = getAuth(req as any);
	if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		// Only return trips for the current user
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

export async function POST(req: NextRequest) {
	const { userId } = getAuth(req as any);
	if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		const body = await req.json();
		const parse = CreateTripSchema.safeParse(body);

		if (!parse.success) {
			console.error("Validation error:", parse.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parse.error.issues }, { status: 400 });
		}

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
			await pusherServer.trigger(`route-${trip.routeId}`, "new-trip", trip);
		} catch (error) {
			console.error("Pusher trigger failed:", error);
		}

		return NextResponse.json(trip, { status: 201 });
	} catch (error) {
		console.error("Error creating trip:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
