import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@taxyciti/database";
import { z } from "zod";

const UpdateRouteSchema = z.object({
	routeId: z.string().min(1),
	permitDoc: z.string().url(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: taxiId } = await params;
		const body = await req.json();

		const validationResult = UpdateRouteSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json({ error: "Validation Error", details: validationResult.error.flatten() }, { status: 400 });
		}

		const { routeId, permitDoc } = validationResult.data;

		// Verify ownership
		const taxi = await prisma.taxi.findUnique({
			where: { id: taxiId },
			include: { driver: true },
		});

		if (!taxi || taxi.driver.userId !== userId) {
			return NextResponse.json({ error: "Taxi not found or unauthorized" }, { status: 404 });
		}

		// Transaction to update permit and route
		await prisma.$transaction(async (tx: any) => {
			// 1. Update Taxi Permit
			await tx.taxi.update({
				where: { id: taxiId },
				data: { permitDoc },
			});

			// 2. Deactivate all current routes for this taxi
			await tx.taxiOnRoute.updateMany({
				where: { taxiId },
				data: { isActive: false },
			});

			// 3. Create or Activate new route
			// Check if relation exists
			const existingRelation = await tx.taxiOnRoute.findUnique({
				where: {
					taxiId_routeId: {
						taxiId,
						routeId,
					},
				},
			});

			if (existingRelation) {
				await tx.taxiOnRoute.update({
					where: { id: existingRelation.id },
					data: { isActive: true },
				});
			} else {
				await tx.taxiOnRoute.create({
					data: {
						taxiId,
						routeId,
						isActive: true,
					},
				});
			}
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating route:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
