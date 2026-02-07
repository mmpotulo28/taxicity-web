import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@taxiciti/database";

// GET /api/ranks - Get all ranks (Used by RideContext/MapView)
export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const url = new URL(req.url);
		const region = url.searchParams.get("region");
		const city = url.searchParams.get("city");
		// const isActive = url.searchParams.get("isActive"); // Drivers generally need active ranks
		const page = parseInt(url.searchParams.get("page") || "1");
		const limit = parseInt(url.searchParams.get("limit") || "100"); // Maximized for map
		const skip = (page - 1) * limit;

		const where: any = {
			isActive: true,
		};

		if (region) {
			where.region = region;
		}

		if (city) {
			where.city = city;
		}

		console.log("Ranks filter (Driver):", where);

		const [ranks, total] = await Promise.all([
			prisma.rank.findMany({
				where,
				orderBy: { name: "asc" },
				skip,
				take: limit,
			}),
			prisma.rank.count({ where }),
		]);

		return NextResponse.json({
			ranks,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("[RANKS_GET_DRIVER]", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
