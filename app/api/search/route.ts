import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const SearchQuerySchema = z.object({
	query: z.string().min(1).max(200),
	type: z.enum(["all", "taxis", "drivers", "routes", "ranks", "users"]).default("all"),
	filters: z
		.object({
			status: z.string().optional(),
			location: z
				.object({
					latitude: z.number().min(-90).max(90),
					longitude: z.number().min(-180).max(180),
					radius: z.number().min(0.1).max(50).default(10), // km
				})
				.optional(),
			availability: z.boolean().optional(),
			rating: z.number().min(1).max(5).optional(),
		})
		.optional(),
});

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371; // Earth's radius in kilometers
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
}

// GET /api/search - Search across multiple entities
export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const query = searchParams.get("query");
		const type = searchParams.get("type") || "all";
		const page = parseInt(searchParams.get("page") || "1", 10);
		const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
		const skip = (page - 1) * limit;

		// Parse filters if provided
		let filters: any = {};

		try {
			const filtersParam = searchParams.get("filters");

			if (filtersParam) {
				filters = JSON.parse(filtersParam);
			}
		} catch {
			// Invalid JSON, ignore filters
		}

		const searchData = SearchQuerySchema.safeParse({
			query,
			type,
			filters,
		});

		if (!searchData.success) {
			return NextResponse.json(
				{ error: "Invalid search parameters", details: searchData.error.issues },
				{ status: 400 },
			);
		}

		const { query: searchQuery, type: searchType, filters: searchFilters } = searchData.data;

		// Get user to determine permissions
		const user = await prisma.user.findUnique({
			where: { clerkId: userId },
			select: { id: true, role: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const results: any = {
			query: searchQuery,
			type: searchType,
			results: {},
			total: 0,
		};

		// Search Taxis
		if (searchType === "all" || searchType === "taxis") {
			const taxiWhere: any = {
				OR: [
					{ registrationNumber: { contains: searchQuery, mode: "insensitive" } },
					{ model: { contains: searchQuery, mode: "insensitive" } },
					{ make: { contains: searchQuery, mode: "insensitive" } },
				],
			};

			if (searchFilters?.status) {
				taxiWhere.status = searchFilters.status;
			}

			const taxis = await prisma.taxi.findMany({
				where: taxiWhere,
				include: {
					currentLocation: true,
					driver: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							rating: true,
						},
					},
					currentRoute: {
						select: {
							id: true,
							name: true,
							sourceRank: { select: { name: true } },
							destinationRank: { select: { name: true } },
						},
					},
				},
				take: limit,
			});

			// Filter by location if provided
			if (searchFilters?.location) {
				const { latitude, longitude, radius } = searchFilters.location;
				const filteredTaxis = taxis.filter((taxi: any) => {
					if (!taxi.currentLocation) return false;
					const distance = calculateDistance(
						latitude,
						longitude,
						taxi.currentLocation.latitude,
						taxi.currentLocation.longitude,
					);

					return distance <= radius;
				});

				results.results.taxis = filteredTaxis.slice(skip, skip + limit);
			} else {
				results.results.taxis = taxis.slice(skip, skip + limit);
			}
		}

		// Search Drivers
		if (searchType === "all" || searchType === "drivers") {
			const driverWhere: any = {
				OR: [
					{ firstName: { contains: searchQuery, mode: "insensitive" } },
					{ lastName: { contains: searchQuery, mode: "insensitive" } },
					{ licenseNumber: { contains: searchQuery, mode: "insensitive" } },
					{ phoneNumber: { contains: searchQuery, mode: "insensitive" } },
				],
			};

			if (searchFilters?.status) {
				driverWhere.status = searchFilters.status;
			}

			if (searchFilters?.rating) {
				driverWhere.rating = { gte: searchFilters.rating };
			}

			// Only show verified drivers to regular users
			if (user.role !== "ADMIN" && user.role !== "SUPPORT") {
				driverWhere.status = "ACTIVE";
			}

			results.results.drivers = await prisma.driver.findMany({
				where: driverWhere,
				select: {
					id: true,
					firstName: true,
					lastName: true,
					phoneNumber: true,
					rating: true,
					status: true,
					currentTaxi: {
						select: {
							id: true,
							registrationNumber: true,
							model: true,
							make: true,
						},
					},
				},
				skip,
				take: limit,
			});
		}

		// Search Routes
		if (searchType === "all" || searchType === "routes") {
			const routeWhere: any = {
				OR: [
					{ name: { contains: searchQuery, mode: "insensitive" } },
					{ sourceRank: { name: { contains: searchQuery, mode: "insensitive" } } },
					{ destinationRank: { name: { contains: searchQuery, mode: "insensitive" } } },
				],
			};

			if (searchFilters?.status) {
				routeWhere.status = searchFilters.status;
			}

			results.results.routes = await prisma.route.findMany({
				where: routeWhere,
				include: {
					sourceRank: {
						select: {
							id: true,
							name: true,
							location: true,
						},
					},
					destinationRank: {
						select: {
							id: true,
							name: true,
							location: true,
						},
					},
				},
				skip,
				take: limit,
			});
		}

		// Search Ranks
		if (searchType === "all" || searchType === "ranks") {
			const rankWhere: any = {
				OR: [
					{ name: { contains: searchQuery, mode: "insensitive" } },
					{ address: { contains: searchQuery, mode: "insensitive" } },
					{ description: { contains: searchQuery, mode: "insensitive" } },
				],
			};

			if (searchFilters?.status) {
				rankWhere.status = searchFilters.status;
			}

			let ranks = await prisma.rank.findMany({
				where: rankWhere,
				include: {
					_count: {
						select: {
							taxis: true,
							sourceRoutes: true,
							destinationRoutes: true,
						},
					},
				},
				take: limit * 2, // Get more to filter by location
			});

			// Filter by location if provided
			if (searchFilters?.location) {
				const { latitude, longitude, radius } = searchFilters.location;

				ranks = ranks.filter((rank: any) => {
					const distance = calculateDistance(
						latitude,
						longitude,
						rank.location.latitude,
						rank.location.longitude,
					);

					return distance <= radius;
				});
			}

			results.results.ranks = ranks.slice(skip, skip + limit);
		}

		// Search Users (admin/support only)
		if (
			(searchType === "all" || searchType === "users") &&
			(user.role === "ADMIN" || user.role === "SUPPORT")
		) {
			const userWhere: any = {
				OR: [
					{ firstName: { contains: searchQuery, mode: "insensitive" } },
					{ lastName: { contains: searchQuery, mode: "insensitive" } },
					{ email: { contains: searchQuery, mode: "insensitive" } },
					{ phoneNumber: { contains: searchQuery, mode: "insensitive" } },
				],
			};

			results.results.users = await prisma.user.findMany({
				where: userWhere,
				select: {
					id: true,
					clerkId: true,
					firstName: true,
					lastName: true,
					email: true,
					phoneNumber: true,
					role: true,
					status: true,
					createdAt: true,
				},
				skip,
				take: limit,
			});
		}

		// Calculate total results
		results.total = Object.values(results.results).reduce(
			(acc: number, items: any) => acc + (Array.isArray(items) ? items.length : 0),
			0,
		);

		return NextResponse.json({
			...results,
			pagination: {
				page,
				limit,
				hasMore: results.total === limit, // Simplified check
			},
		});
	} catch (error) {
		console.error("Error performing search:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// POST /api/search - Advanced search with complex filters
export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const parsed = SearchQuerySchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid search data", details: parsed.error.issues },
				{ status: 400 },
			);
		}

		// For now, redirect to GET with query parameters
		// This could be expanded for more complex search logic
		const searchParams = new URLSearchParams({
			query: parsed.data.query,
			type: parsed.data.type,
		});

		if (parsed.data.filters) {
			searchParams.set("filters", JSON.stringify(parsed.data.filters));
		}

		return NextResponse.redirect(new URL(`/api/search?${searchParams.toString()}`, req.url));
	} catch (error) {
		console.error("Error processing advanced search:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
