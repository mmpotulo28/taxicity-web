import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = await auth();
		const { id } = await params;

		if (!userId) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const trip = await prisma.trip.findUnique({
			where: { id },
			include: {
				route: true,
				taxi: {
					include: {
						driver: true,
					},
				},
				vehicleTrip: {
					include: {
						passengers: {
							select: {
								id: true,
								status: true,
							},
						},
					},
				},
			},
		});

		if (!trip) {
			return new NextResponse("Trip not found", { status: 404 });
		}

		return NextResponse.json(trip);
	} catch (error) {
		console.error("[TRIP_GET]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
