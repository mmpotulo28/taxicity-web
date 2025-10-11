import { NextResponse } from "next/server";

export async function GET() {
	const status = {
		status: "operational",
		version: "1.0.0",
		timestamp: new Date().toISOString(),
		endpoints: {
			users: "/api/users",
			drivers: "/api/drivers",
			taxis: "/api/taxis",
			routes: "/api/routes",
			ranks: "/api/ranks",
			reports: "/api/reports",
			support: "/api/support",
			search: "/api/search",
		},
		documentation: {
			interactive: "/api-docs",
			openapi: "/api/openapi",
			readme: "/docs/API.md",
		},
		environment: process.env.NODE_ENV || "development",
		uptime: process.uptime(),
	};

	return NextResponse.json(status, {
		headers: {
			"Cache-Control": "no-cache",
		},
	});
}
