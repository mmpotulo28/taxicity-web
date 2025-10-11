import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const UpdateReportSchema = z.object({
	status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "DISMISSED"]).optional(),
	priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
	assignedToId: z.string().uuid().optional(),
	adminNotes: z.string().max(2000).optional(),
	resolution: z.string().max(2000).optional(),
});

// GET /api/reports/[id] - Get specific report
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user to determine permissions
		const user = await prisma.user.findUnique({
			where: { clerkId: userId },
			select: { id: true, role: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const report = await prisma.report.findUnique({
			where: { id: params.id },
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
		});

		if (!report) {
			return NextResponse.json({ error: "Report not found" }, { status: 404 });
		}

		// Check permissions: admin/support can see all, users can only see their own
		if (user.role !== "ADMIN" && user.role !== "SUPPORT" && report.reporterId !== user.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		return NextResponse.json(report);
	} catch (error) {
		console.error("Error fetching report:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// PUT /api/reports/[id] - Update report (admin/support only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user to check permissions
		const user = await prisma.user.findUnique({
			where: { clerkId: userId },
			select: { id: true, role: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Only admin and support can update reports
		if (user.role !== "ADMIN" && user.role !== "SUPPORT") {
			return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
		}

		const body = await req.json();
		const parsed = UpdateReportSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid data", details: parsed.error.issues },
				{ status: 400 },
			);
		}

		// Check if report exists
		const existingReport = await prisma.report.findUnique({
			where: { id: params.id },
		});

		if (!existingReport) {
			return NextResponse.json({ error: "Report not found" }, { status: 404 });
		}

		// Validate assignedToId if provided
		if (parsed.data.assignedToId) {
			const assignedUser = await prisma.user.findUnique({
				where: { id: parsed.data.assignedToId },
				select: { id: true, role: true },
			});

			if (!assignedUser) {
				return NextResponse.json({ error: "Assigned user not found" }, { status: 404 });
			}

			// Only allow assignment to admin or support users
			if (assignedUser.role !== "ADMIN" && assignedUser.role !== "SUPPORT") {
				return NextResponse.json(
					{ error: "Can only assign to admin or support users" },
					{ status: 400 },
				);
			}
		}

		// Update the report
		const updatedReport = await prisma.report.update({
			where: { id: params.id },
			data: {
				...parsed.data,
				updatedAt: new Date(),
				...(parsed.data.status === "RESOLVED" && { resolvedAt: new Date() }),
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
				assignedTo: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
			},
		});

		return NextResponse.json(updatedReport);
	} catch (error) {
		console.error("Error updating report:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// DELETE /api/reports/[id] - Delete report (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user to check permissions
		const user = await prisma.user.findUnique({
			where: { clerkId: userId },
			select: { id: true, role: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Only admins can delete reports
		if (user.role !== "ADMIN") {
			return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
		}

		// Check if report exists
		const existingReport = await prisma.report.findUnique({
			where: { id: params.id },
		});

		if (!existingReport) {
			return NextResponse.json({ error: "Report not found" }, { status: 404 });
		}

		// Delete the report
		await prisma.report.delete({
			where: { id: params.id },
		});

		return NextResponse.json({ message: "Report deleted successfully" });
	} catch (error) {
		console.error("Error deleting report:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
