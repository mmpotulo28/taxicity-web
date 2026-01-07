import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@taxicity/database";
import { Report } from "@prisma/client";

const CreateReportSchema = z.object({
	reporterType: z.enum(["USER", "DRIVER", "ADMIN"]),
	reportedType: z.enum(["DRIVER", "TAXI", "USER", "ROUTE", "SYSTEM"]),
	reportedId: z.string(),
	category: z.enum(["SAFETY_CONCERN", "INAPPROPRIATE_BEHAVIOR", "VEHICLE_CONDITION", "ROUTE_ISSUE", "PAYMENT_DISPUTE", "DISCRIMINATION", "TECHNICAL_ISSUE", "OTHER"]),
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
	assignedToId: z.string().optional(),
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
		const client = await clerkClient();
		const user = await client.users.getUser(userId);
		const role = (user.publicMetadata.role as string) || "USER";

		// Filter conditions based on user role
		const whereCondition: any = {};

		if (role === "ADMIN" || role === "SUPPORT") {
			// Admins and support can see all reports
			const status = searchParams.get("status");
			const category = searchParams.get("category");
			// const severity = searchParams.get("severity"); // Not in schema
			// const reportedType = searchParams.get("reportedType"); // Not in schema

			if (status) whereCondition.status = status;
			if (category) whereCondition.type = category;
			// if (severity) whereCondition.severity = severity;
			// if (reportedType) whereCondition.reportedType = reportedType;
		} else {
			// Regular users can only see their own reports
			whereCondition.reporterId = userId;
		}

		const [reports, total] = await Promise.all([
			prisma.report.findMany({
				where: whereCondition,
				orderBy: [{ createdAt: "desc" }],
				skip,
				take: limit,
			}),
			prisma.report.count({ where: whereCondition }),
		]);

		// Fetch user details for reporter and assignedToUser
		const userIds = new Set<string>();
		reports.forEach((report: Report) => {
			if (report.reporterId) userIds.add(report.reporterId);
			if (report.assignedTo) userIds.add(report.assignedTo);
		});

		const usersMap = new Map<string, any>();
		if (userIds.size > 0) {
			try {
				const usersList = await client.users.getUserList({ userId: Array.from(userIds) });
				usersList.data.forEach((u) => {
					usersMap.set(u.id, {
						id: u.id,
						fullName: `${u.firstName} ${u.lastName}`,
						email: u.emailAddresses[0]?.emailAddress,
						role: u.publicMetadata.role,
					});
				});
			} catch (error) {
				console.error("Error fetching users from Clerk:", error);
			}
		}

		const enrichedReports = reports.map((report: Report) => ({
			...report,
			reporter: report.reporterId ? usersMap.get(report.reporterId) : null,
			assignedToUser: report.assignedTo ? usersMap.get(report.assignedTo) : null,
		}));

		return NextResponse.json({
			reports: enrichedReports,
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
			console.error("Validation error:", parsed.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
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
				// Check if user exists in Clerk
				try {
					const client = await clerkClient();
					await client.users.getUser(reportedId);
					reportedEntityExists = true;
				} catch (error) {
					reportedEntityExists = false;
				}
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
		const reportData: any = {
			type: parsed.data.category,
			description: parsed.data.description,
			reporterId: userId,
			status: "OPEN",
			images: parsed.data.evidence || [],
		};

		if (reportedType === "TAXI") {
			reportData.taxiId = reportedId;
		} else if (reportedType === "DRIVER") {
			reportData.driverId = reportedId;
		}
		// Note: Schema doesn't support routeId or reportedUserId yet.
		// We could append to description or add fields later.

		const report = await prisma.report.create({
			data: reportData,
		});

		return NextResponse.json(report, { status: 201 });
	} catch (error) {
		console.error("Error creating report:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
