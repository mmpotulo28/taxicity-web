import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const UpdateStatusSchema = z.object({
	status: z.enum(["BOARDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

// PATCH /api/driver/vehicle-trips/[id] - Update vehicle trip status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const { id } = await params;
		const body = await req.json();
		const parse = UpdateStatusSchema.safeParse(body);

		if (!parse.success) {
			return NextResponse.json({ error: "Invalid status" }, { status: 400 });
		}

		const { status } = parse.data;

		const vehicleTrip = await prisma.vehicleTrip.findUnique({
			where: { id },
			include: { driver: true },
		});

		if (!vehicleTrip) {
			return NextResponse.json({ error: "Trip not found" }, { status: 404 });
		}

		if (vehicleTrip.driver.userId !== userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const updateData: any = { status };
		if (status === "COMPLETED") {
			updateData.endTime = new Date();
		}

		const updatedTrip = await prisma.vehicleTrip.update({
			where: { id },
			data: updateData,
		});

		return NextResponse.json(updatedTrip);
	} catch (error) {
		console.error("Error updating vehicle trip:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
