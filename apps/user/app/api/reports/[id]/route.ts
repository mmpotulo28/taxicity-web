import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@taxyciti/database";

const UpdateReportSchema = z.object({
	status: z.enum(["OPEN", "UNDER_REVIEW", "RESOLVED", "CLOSED"]).optional(),
	assignedTo: z.string().optional(),
	resolution: z.string().max(2000).optional(),
});

// GET /api/reports/[id] - Get specific report
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user to determine permissions
		const client = await clerkClient();
		const user = await client.users.getUser(userId);
		const role = (user.publicMetadata.role as string) || "USER";

		const report = await prisma.report.findUnique({
			where: { id },
		});

		if (!report) {
			return NextResponse.json({ error: "Report not found" }, { status: 404 });
		}

		// Check permissions: admin/support can see all, users can only see their own
		if (role !== "ADMIN" && role !== "SUPPORT" && report.reporterId !== userId) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Fetch reporter and assigned user details
		let reporter: { id: string; fullName: string; email?: string; role?: unknown } | null = null;
		let assignedToUser: { id: string; fullName: string; email?: string } | null = null;

		if (report.reporterId) {
			try {
				const u = await client.users.getUser(report.reporterId);
				reporter = {
					id: u.id,
					fullName: `${u.firstName} ${u.lastName}`,
					email: u.emailAddresses[0]?.emailAddress,
					role: u.publicMetadata.role,
				};
			} catch (e) {
				console.error("Error fetching reporter:", e);
			}
		}

		if (report.assignedTo) {
			try {
				const u = await client.users.getUser(report.assignedTo);
				assignedToUser = {
					id: u.id,
					fullName: `${u.firstName} ${u.lastName}`,
					email: u.emailAddresses[0]?.emailAddress,
				};
			} catch (e) {
				console.error("Error fetching assigned user:", e);
			}
		}

		return NextResponse.json({
			...report,
			reporter,
			assignedToUser,
		});
	} catch (error) {
		console.error("Error fetching report:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// PUT /api/reports/[id] - Update report (admin/support only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user to check permissions
		const client = await clerkClient();
		const user = await client.users.getUser(userId);
		const role = (user.publicMetadata.role as string) || "USER";

		// Only admin and support can update reports
		if (role !== "ADMIN" && role !== "SUPPORT") {
			return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
		}

		const body = await req.json();
		const parsed = UpdateReportSchema.safeParse(body);

		if (!parsed.success) {
			console.error("Validation error:", parsed.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
		}

		// Check if report exists
		const existingReport = await prisma.report.findUnique({
			where: { id },
		});

		if (!existingReport) {
			return NextResponse.json({ error: "Report not found" }, { status: 404 });
		}

		// Validate assignedTo if provided
		if (parsed.data.assignedTo) {
			try {
				const assignedUser = await client.users.getUser(parsed.data.assignedTo);
				const assignedUserRole = (assignedUser.publicMetadata.role as string) || "USER";

				// Only allow assignment to admin or support users
				if (assignedUserRole !== "ADMIN" && assignedUserRole !== "SUPPORT") {
					return NextResponse.json({ error: "Can only assign to admin or support users" }, { status: 400 });
				}
			} catch (error) {
				return NextResponse.json({ error: "Assigned user not found" }, { status: 404 });
			}
		}

		// Update the report
		const updateData: any = {};
		if (parsed.data.status) updateData.status = parsed.data.status;
		if (parsed.data.assignedTo) updateData.assignedTo = parsed.data.assignedTo;
		if (parsed.data.resolution) updateData.resolutionNotes = parsed.data.resolution;
		if (parsed.data.status === "RESOLVED" || parsed.data.status === "CLOSED") {
			updateData.closedAt = new Date();
		}

		const updatedReport = await prisma.report.update({
			where: { id },
			data: updateData,
		});

		// Fetch reporter and assigned user details for response
		let reporter: { id: string; fullName: string; email?: string; role?: unknown } | null = null;
		let assignedToUser: { id: string; fullName: string; email?: string } | null = null;

		if (updatedReport.reporterId) {
			try {
				const u = await client.users.getUser(updatedReport.reporterId);
				reporter = {
					id: u.id,
					fullName: `${u.firstName} ${u.lastName}`,
					email: u.emailAddresses[0]?.emailAddress,
					role: u.publicMetadata.role,
				};
			} catch (e) {
				console.error("Error fetching reporter:", e);
			}
		}

		if (updatedReport.assignedTo) {
			try {
				const u = await client.users.getUser(updatedReport.assignedTo);
				assignedToUser = {
					id: u.id,
					fullName: `${u.firstName} ${u.lastName}`,
					email: u.emailAddresses[0]?.emailAddress,
				};
			} catch (e) {
				console.error("Error fetching assigned user:", e);
			}
		}

		return NextResponse.json({
			...updatedReport,
			reporter,
			assignedToUser,
		});
	} catch (error) {
		console.error("Error updating report:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// DELETE /api/reports/[id] - Delete report (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { userId } = getAuth(req);
		const { id } = await params;

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user to check permissions
		const client = await clerkClient();
		const user = await client.users.getUser(userId);
		const role = (user.publicMetadata.role as string) || "USER";

		// Only admins can delete reports
		if (role !== "ADMIN") {
			return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
		}

		// Check if report exists
		const existingReport = await prisma.report.findUnique({
			where: { id },
		});

		if (!existingReport) {
			return NextResponse.json({ error: "Report not found" }, { status: 404 });
		}

		// Delete the report
		await prisma.report.delete({
			where: { id },
		});

		return NextResponse.json({ message: "Report deleted successfully" });
	} catch (error) {
		console.error("Error deleting report:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
