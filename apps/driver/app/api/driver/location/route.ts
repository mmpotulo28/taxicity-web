import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const UpdateLocationSchema = z.object({
	lat: z.number(),
	lng: z.number(),
	heading: z.number().nullable().optional(),
	speed: z.number().nullable().optional(),
});

export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const body = await req.json();
		const parse = UpdateLocationSchema.safeParse(body);

		if (!parse.success) {
			return NextResponse.json({ error: "Invalid data" }, { status: 400 });
		}

		const { lat, lng, heading, speed } = parse.data;

		// 1. Find the active taxi for the driver
		const taxi = await prisma.taxi.findFirst({
			where: {
				driver: { userId },
				status: { in: ["AVAILABLE", "BUSY"] },
			},
		});

		if (!taxi) {
			return NextResponse.json({ error: "No active taxi found" }, { status: 404 });
		}

		const taxiId = taxi.id;

		// 2. Update Taxi Location
		// We use upsert to either create a new location record or update the existing one for this taxi
		await prisma.taxiLocation.upsert({
			where: { taxiId },
			create: {
				taxiId,
				lat,
				lng,
				heading: heading || 0,
				speed: speed || 0,
			},
			update: {
				lat,
				lng,
				heading: heading || 0,
				speed: speed || 0,
				createdAt: new Date(), // Update timestamp to show freshness
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Location update error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
