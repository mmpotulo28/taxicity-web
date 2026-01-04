import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const { taxiId, routeId } = body;

		if (!taxiId || !routeId) {
			return NextResponse.json({ error: "Missing taxiId or routeId" }, { status: 400 });
		}

		// Verify driver owns the taxi
		const driver = await prisma.driver.findUnique({
			where: { userId },
			include: { taxis: true },
		});

		if (!driver) {
			return NextResponse.json({ error: "Driver not found" }, { status: 404 });
		}

		const ownsTaxi = driver.taxis.some((t: { id: string }) => t.id === taxiId);
		if (!ownsTaxi) {
			return NextResponse.json({ error: "Taxi not owned by driver" }, { status: 403 });
		}

		// Check if already assigned to this route
		const existingAssignment = await prisma.taxiOnRoute.findUnique({
			where: {
				taxiId_routeId: {
					taxiId,
					routeId,
				},
			},
		});

		if (existingAssignment) {
			// If already assigned, just ensure it's active
			const updated = await prisma.taxiOnRoute.update({
				where: {
					taxiId_routeId: {
						taxiId,
						routeId,
					},
				},
				data: {
					isActive: true,
					joinedAt: new Date(),
				},
			});
			return NextResponse.json(updated);
		}

		// Create new assignment
		const assignment = await prisma.taxiOnRoute.create({
			data: {
				taxiId,
				routeId,
				isActive: true,
			},
		});

		return NextResponse.json(assignment);
	} catch (error) {
		console.error("Error assigning route:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
