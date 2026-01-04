import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const body = await req.json();
		const { taxiId } = body;

		if (!taxiId) {
			return NextResponse.json({ error: "Taxi ID required" }, { status: 400 });
		}

		const trip = await prisma.trip.update({
			where: { id: params.id },
			data: {
				status: "ACCEPTED",
				taxiId: taxiId,
			},
			include: {
				taxi: true,
			},
		});

		return NextResponse.json(trip);
	} catch (error) {
		console.error("Error accepting trip:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
