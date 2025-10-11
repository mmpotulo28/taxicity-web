import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const CreateReportSchema = z.object({
	reporterType: z.enum(["USER", "DRIVER", "ADMIN"]),
	reportedType: z.enum(["DRIVER", "TAXI", "USER", "ROUTE", "SYSTEM"]),
	reportedId: z.string().uuid(),
	category: z.enum([
		"SAFETY_CONCERN",
		"INAPPROPRIATE_BEHAVIOR",
		"VEHICLE_CONDITION",
		"ROUTE_ISSUE",
		"PAYMENT_DISPUTE",
		"DISCRIMINATION",
		"TECHNICAL_ISSUE",
		"OTHER",
	]),
	title: z.string().min(5).max(200),
	description: z.string().min(10).max(2000),
	severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
	evidence: z.array(z.string().url()).optional(),
	location: z
		.object({
			latitude: z.number().min(-90).max(90),
			longitude: z.number().min(-180).max(180),
			address: z.string().optional(),
		})
		.optional(),
});

const UpdateReportSchema = z.object({
	status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "DISMISSED"]).optional(),
	priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
	assignedToId: z.string().uuid().optional(),
	adminNotes: z.string().max(2000).optional(),
	resolution: z.string().max(2000).optional(),
});

// GET /api/reports - Get reports (filtered by role and permissions)
export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const page = parseInt(searchParams.get("page") || "1", 10);
		const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
		const skip = (page - 1) * limit;

		// Get user to determine role and permissions
		const user = await prisma.user.findUnique({
			where: { clerkId: userId },
			select: { id: true, role: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Filter conditions based on user role
		let whereCondition: any = {};

		if (user.role === "ADMIN" || user.role === "SUPPORT") {
			// Admins and support can see all reports
			const status = searchParams.get("status");
			const category = searchParams.get("category");
			const severity = searchParams.get("severity");
			const reportedType = searchParams.get("reportedType");

			if (status) whereCondition.status = status;
			if (category) whereCondition.category = category;
			if (severity) whereCondition.severity = severity;
			if (reportedType) whereCondition.reportedType = reportedType;
		} else {
			// Regular users can only see their own reports
			whereCondition.reporterId = user.id;
		}

		const [reports, total] = await Promise.all([
			prisma.report.findMany({
				where: whereCondition,
				include: {
					reporter: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
							role: true,
						},
					},
					assignedTo: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
						},
					},
				},
				orderBy: [{ createdAt: "desc" }],
				skip,
				take: limit,
			}),
			prisma.report.count({ where: whereCondition }),
		]);

		return NextResponse.json({
			reports,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching reports:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// POST /api/reports - Create new report
export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const parsed = CreateReportSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid data", details: parsed.error.issues },
				{ status: 400 },
			);
		}

		// Get reporter information
		const reporter = await prisma.user.findUnique({
			where: { clerkId: userId },
			select: { id: true, role: true },
		});

		if (!reporter) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Validate that the reported entity exists
		const { reportedType, reportedId } = parsed.data;
		let reportedEntityExists = false;

		switch (reportedType) {
			case "DRIVER":
				reportedEntityExists = !!(await prisma.driver.findUnique({
					where: { id: reportedId },
				}));
				break;
			case "TAXI":
				reportedEntityExists = !!(await prisma.taxi.findUnique({
					where: { id: reportedId },
				}));
				break;
			case "USER":
				reportedEntityExists = !!(await prisma.user.findUnique({
					where: { id: reportedId },
				}));
				break;
			case "ROUTE":
				reportedEntityExists = !!(await prisma.route.findUnique({
					where: { id: reportedId },
				}));
				break;
			case "SYSTEM":
				// System reports don't need entity validation
				reportedEntityExists = true;
				break;
		}

		if (!reportedEntityExists) {
			return NextResponse.json({ error: "Reported entity not found" }, { status: 404 });
		}

		// Create the report
		const report = await prisma.report.create({
			data: {
				...parsed.data,
				reporterId: reporter.id,
				status: "OPEN",
				priority: parsed.data.severity === "CRITICAL" ? "URGENT" : "MEDIUM",
			},
			include: {
				reporter: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						role: true,
					},
				},
			},
		});

		return NextResponse.json(report, { status: 201 });
	} catch (error) {
		console.error("Error creating report:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
