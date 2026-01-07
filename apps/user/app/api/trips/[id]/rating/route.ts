import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@taxicity/database";

const RatingSchema = z.object({
	rating: z.number().min(1).max(5),
	comment: z.string().optional(),
});

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const { userId } = getAuth(req);
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const tripId = params.id;

	try {
		const body = await req.json();
		const { rating, comment } = RatingSchema.parse(body);

		// 1. Verify trip exists, belongs to user, and is completed
		const trip = await prisma.trip.findUnique({
			where: { id: tripId },
			include: {
				taxi: {
					include: {
						driver: true,
					},
				},
			},
		});

		if (!trip) {
			return NextResponse.json({ error: "Trip not found" }, { status: 404 });
		}

		if (trip.userId !== userId) {
			return NextResponse.json({ error: "Unauthorized to rate this trip" }, { status: 403 });
		}

		if (trip.status !== "COMPLETED") {
			return NextResponse.json({ error: "Trip must be completed to rate" }, { status: 400 });
		}

		if (!trip.taxi || !trip.taxi.driver) {
			return NextResponse.json({ error: "No driver found for this trip" }, { status: 400 });
		}

		// 2. Check if already rated
		const existingRating = await prisma.tripRating.findUnique({
			where: { tripId },
		});

		if (existingRating) {
			return NextResponse.json({ error: "Trip already rated" }, { status: 409 });
		}

		// 3. Create Rating
		const newRating = await prisma.tripRating.create({
			data: {
				tripId,
				userId,
				driverId: trip.taxi.driver.id,
				rating,
				comment,
			},
		});

		return NextResponse.json(newRating, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
		}
		console.error("Error submitting rating:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
