import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";
import prisma from "@/lib/prisma/generated";

const TripSchema = z.object({
	route: z.string(),
	date: z.string(),
	time: z.string(),
	pickup: z.string(),
	dropoff: z.string(),
	driver: z.string(),
	taxi: z.string(),
	fare: z.string(),
	status: z.string(),
});

export async function GET(req: NextRequest) {
	const { userId } = getAuth(req);
	if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	// Only return trips for the current user
	const trips = await prisma.trip.findMany({
		where: { userId },
		orderBy: { date: "desc" },
	});
	return NextResponse.json(trips);
}

export async function POST(req: NextRequest) {
	const { userId } = getAuth(req);
	if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await req.json();
	const parse = TripSchema.safeParse(body);
	if (!parse.success) {
		return NextResponse.json(
			{ error: "Invalid data", details: parse.error.issues },
			{ status: 400 },
		);
	}

	const trip = await prisma.trips.create({
		data: { ...parse.data, userId },
	});
	return NextResponse.json(trip, { status: 201 });
}
