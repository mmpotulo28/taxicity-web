import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxyciti/database";
import { auth } from "@clerk/nextjs/server";

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await context.params;
		const body = await req.json();
		const { name, address, city, province, region, lat, lng, capacity, operatingHours } = body;

		const rank = await prisma.rank.update({
			where: { id },
			data: {
				name,
				address,
				city,
				province,
				region,
				lat: lat ? parseFloat(lat) : undefined,
				lng: lng ? parseFloat(lng) : undefined,
				capacity: capacity ? parseInt(capacity) : undefined,
				operatingHours,
			},
		});

		return NextResponse.json(rank);
	} catch (error) {
		console.error("Error updating rank:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest, context: RouteContext) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await context.params;

		await prisma.rank.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting rank:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
