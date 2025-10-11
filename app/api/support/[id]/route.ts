import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const CreateSupportMessageSchema = z.object({
	message: z.string().min(1).max(5000),
	attachments: z.array(z.string().url()).optional(),
	isInternal: z.boolean().default(false),
});

const UpdateSupportTicketSchema = z.object({
	status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_FOR_USER", "RESOLVED", "CLOSED"]).optional(),
	priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
	assignedToId: z.string().uuid().optional(),
	category: z
		.enum([
			"ACCOUNT_ISSUE",
			"PAYMENT_PROBLEM",
			"TECHNICAL_SUPPORT",
			"BOOKING_ISSUE",
			"DRIVER_COMPLAINT",
			"FEATURE_REQUEST",
			"BUG_REPORT",
			"OTHER",
		])
		.optional(),
	resolution: z.string().max(2000).optional(),
});

// GET /api/support/[id] - Get specific support ticket with messages
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

		const ticket = await prisma.supportTicket.findUnique({
			where: { id: params.id },
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
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
				messages: {
					include: {
						author: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
								role: true,
							},
						},
					},
					orderBy: { createdAt: "asc" },
				},
			},
		});

		if (!ticket) {
			return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
		}

		// Check permissions: staff can see all, users can only see their own
		if (user.role !== "ADMIN" && user.role !== "SUPPORT" && ticket.userId !== user.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Filter out internal messages for regular users
		if (user.role !== "ADMIN" && user.role !== "SUPPORT") {
			ticket.messages = ticket.messages.filter((message: any) => !message.isInternal);
		}

		return NextResponse.json(ticket);
	} catch (error) {
		console.error("Error fetching support ticket:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// PUT /api/support/[id] - Update support ticket (staff only)
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

		// Only staff can update support tickets
		if (user.role !== "ADMIN" && user.role !== "SUPPORT") {
			return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
		}

		const body = await req.json();
		const parsed = UpdateSupportTicketSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid data", details: parsed.error.issues },
				{ status: 400 },
			);
		}

		// Check if ticket exists
		const existingTicket = await prisma.supportTicket.findUnique({
			where: { id: params.id },
		});

		if (!existingTicket) {
			return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
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

			// Only allow assignment to staff users
			if (assignedUser.role !== "ADMIN" && assignedUser.role !== "SUPPORT") {
				return NextResponse.json(
					{ error: "Can only assign to staff users" },
					{ status: 400 },
				);
			}
		}

		// Update the ticket
		const updatedTicket = await prisma.supportTicket.update({
			where: { id: params.id },
			data: {
				...parsed.data,
				updatedAt: new Date(),
				...(parsed.data.status === "RESOLVED" && { resolvedAt: new Date() }),
			},
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
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

		return NextResponse.json(updatedTicket);
	} catch (error) {
		console.error("Error updating support ticket:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// POST /api/support/[id] - Add message to support ticket
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const parsed = CreateSupportMessageSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid data", details: parsed.error.issues },
				{ status: 400 },
			);
		}

		// Get user information
		const user = await prisma.user.findUnique({
			where: { clerkId: userId },
			select: { id: true, role: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Check if ticket exists and user has permission
		const ticket = await prisma.supportTicket.findUnique({
			where: { id: params.id },
			select: { id: true, userId: true, status: true },
		});

		if (!ticket) {
			return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
		}

		// Check permissions
		const isStaff = user.role === "ADMIN" || user.role === "SUPPORT";
		const isTicketOwner = ticket.userId === user.id;

		if (!isStaff && !isTicketOwner) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Don't allow regular users to add internal messages
		if (!isStaff && parsed.data.isInternal) {
			return NextResponse.json({ error: "Cannot create internal messages" }, { status: 403 });
		}

		// Create the message
		const message = await prisma.supportMessage.create({
			data: {
				ticketId: params.id,
				authorId: user.id,
				message: parsed.data.message,
				isFromUser: !isStaff,
				isInternal: parsed.data.isInternal || false,
				attachments: parsed.data.attachments || [],
			},
			include: {
				author: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						role: true,
					},
				},
			},
		});

		// Update ticket status and timestamp
		await prisma.supportTicket.update({
			where: { id: params.id },
			data: {
				updatedAt: new Date(),
				// If user responds, change status from WAITING_FOR_USER to IN_PROGRESS
				...(ticket.status === "WAITING_FOR_USER" && !isStaff && { status: "IN_PROGRESS" }),
			},
		});

		return NextResponse.json(message, { status: 201 });
	} catch (error) {
		console.error("Error creating support message:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
