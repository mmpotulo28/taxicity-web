import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@taxiciti/database";

// GET /api/routes - Get all routes with optional filtering (For Driver App Visualization)
export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const url = new URL(req.url);
		const status = url.searchParams.get("status");
		const sourceRankId = url.searchParams.get("sourceRankId");
		const destRankId = url.searchParams.get("destRankId");
		const page = parseInt(url.searchParams.get("page") || "1");
		// Drivers might need to see all routes, or filtered ones. Defaulting to similar logic as user app.
		const limit = parseInt(url.searchParams.get("limit") || "50"); // Higher limit for drivers potentially
		const skip = (page - 1) * limit;

		const where: any = {};

		// By default, maybe only show ACTIVE routes to drivers?
		if (status) {
			where.status = status;
		} else {
			where.status = "ACTIVE";
		}

		if (sourceRankId) {
			where.sourceRankId = sourceRankId;
		}

		if (destRankId) {
			where.destRankId = destRankId;
		}

		const [routes, total] = await Promise.all([
			prisma.route.findMany({
				where,
				include: {
					sourceRank: {
						select: {
							id: true,
							name: true,
							address: true,
							lat: true,
							lng: true,
						},
					},
					destRank: {
						select: {
							id: true,
							name: true,
							address: true,
							lat: true,
							lng: true,
						},
					},
					popularLocations: true,
					// We need the polyline, which is a default scalar field.
					// We explicitly don't select specific fields on the root object to ensure all scalars (like polyline) are returned.
				},
				orderBy: { name: "asc" },
				skip,
				take: limit,
			}),
			prisma.route.count({ where }),
		]);

		return NextResponse.json({
			routes,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("[ROUTES_GET]", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
