import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxicity/database";

// GET /api/taxis/[id]/location/history - Get taxi's location history
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const url = new URL(req.url);
		const limit = parseInt(url.searchParams.get("limit") || "50");
		const page = parseInt(url.searchParams.get("page") || "1");
		const skip = (page - 1) * limit;

		const [locations, total] = await Promise.all([
			prisma.taxiLocation.findMany({
				where: { taxiHistoryId: id },
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.taxiLocation.count({
				where: { taxiHistoryId: id },
			}),
		]);

		return NextResponse.json({
			locations,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching taxi location history:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
