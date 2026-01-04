import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const CreateSupportMessageSchema = z.object({
	message: z.string().min(1).max(5000),
	attachments: z.array(z.string().url()).optional(),
	isInternal: z.boolean().default(false),
});

const UpdateSupportTicketSchema = z.object({
	status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
	priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
	assignedTo: z.string().optional(),
	category: z.enum(["ACCOUNT_ISSUE", "PAYMENT_PROBLEM", "TECHNICAL_SUPPORT", "BOOKING_ISSUE", "DRIVER_COMPLAINT", "FEATURE_REQUEST", "BUG_REPORT", "OTHER"]).optional(),
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
		const client = await clerkClient();
		const user = await client.users.getUser(userId);
		const role = (user.publicMetadata.role as string) || "USER";

		const ticket = await prisma.supportTicket.findUnique({
			where: { id: params.id },
			include: {
				messages: {
					orderBy: { createdAt: "asc" },
				},
			},
		});

		if (!ticket) {
			return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
		}

		// Check permissions: staff can see all, users can only see their own
		if (role !== "ADMIN" && role !== "SUPPORT" && ticket.userId !== userId) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Filter out internal messages for regular users
		if (role !== "ADMIN" && role !== "SUPPORT") {
			ticket.messages = ticket.messages.filter((message: any) => !message.isInternal);
		}

		// Fetch user details for ticket and messages
		const userIds = new Set<string>();
		if (ticket.userId) userIds.add(ticket.userId);
		if (ticket.assignedTo) userIds.add(ticket.assignedTo);
		ticket.messages.forEach((msg: any) => {
			if (msg.senderId) userIds.add(msg.senderId);
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

		const enrichedTicket = {
			...ticket,
			user: ticket.userId ? usersMap.get(ticket.userId) : null,
			assignedToUser: ticket.assignedTo ? usersMap.get(ticket.assignedTo) : null,
			messages: ticket.messages.map((msg: any) => ({
				...msg,
				senderUser: msg.senderId ? usersMap.get(msg.senderId) : null,
			})),
		};

		return NextResponse.json(enrichedTicket);
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
		const client = await clerkClient();
		const user = await client.users.getUser(userId);
		const role = (user.publicMetadata.role as string) || "USER";

		// Only staff can update support tickets
		if (role !== "ADMIN" && role !== "SUPPORT") {
			return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
		}

		const body = await req.json();
		const parsed = UpdateSupportTicketSchema.safeParse(body);

		if (!parsed.success) {
			console.error("Validation error:", parsed.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
		}

		// Check if ticket exists
		const existingTicket = await prisma.supportTicket.findUnique({
			where: { id: params.id },
		});

		if (!existingTicket) {
			return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
		}

		// Validate assignedTo if provided
		if (parsed.data.assignedTo) {
			try {
				const assignedUser = await client.users.getUser(parsed.data.assignedTo);
				const assignedUserRole = (assignedUser.publicMetadata.role as string) || "USER";

				// Only allow assignment to staff users
				if (assignedUserRole !== "ADMIN" && assignedUserRole !== "SUPPORT") {
					return NextResponse.json({ error: "Can only assign to staff users" }, { status: 400 });
				}
			} catch (error) {
				return NextResponse.json({ error: "Assigned user not found" }, { status: 404 });
			}
		}

		// Update the ticket
		const updateData: any = {};
		if (parsed.data.status) updateData.status = parsed.data.status;
		if (parsed.data.priority) updateData.priority = parsed.data.priority;
		if (parsed.data.assignedTo) updateData.assignedTo = parsed.data.assignedTo;
		if (parsed.data.category) updateData.category = parsed.data.category;
		// resolution is ignored for now as it's not in schema

		const updatedTicket = await prisma.supportTicket.update({
			where: { id: params.id },
			data: {
				...updateData,
				updatedAt: new Date(),
			},
		});

		// Fetch user details for response
		let ticketUser = null;
		let assignedToUser = null;

		if (updatedTicket.userId) {
			try {
				const u = await client.users.getUser(updatedTicket.userId);
				ticketUser = {
					id: u.id,
					fullName: `${u.firstName} ${u.lastName}`,
					email: u.emailAddresses[0]?.emailAddress,
				};
			} catch (e) {
				console.error("Error fetching user:", e);
			}
		}

		if (updatedTicket.assignedTo) {
			try {
				const u = await client.users.getUser(updatedTicket.assignedTo);
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
			...updatedTicket,
			user: ticketUser,
			assignedToUser,
		});
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
			console.error("Validation error:", parsed.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
		}

		// Get user to check permissions
		const client = await clerkClient();
		const user = await client.users.getUser(userId);
		const role = (user.publicMetadata.role as string) || "USER";

		// Check if ticket exists
		const ticket = await prisma.supportTicket.findUnique({
			where: { id: params.id },
		});

		if (!ticket) {
			return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
		}

		// Check permissions
		if (role !== "ADMIN" && role !== "SUPPORT" && ticket.userId !== userId) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Regular users cannot send internal messages
		if (parsed.data.isInternal && role !== "ADMIN" && role !== "SUPPORT") {
			return NextResponse.json({ error: "Forbidden: Cannot send internal messages" }, { status: 403 });
		}

		// Create the message
		const message = await prisma.supportMessage.create({
			data: {
				ticketId: params.id,
				senderId: userId,
				message: parsed.data.message,
				attachments: parsed.data.attachments || [],
				isInternal: parsed.data.isInternal,
			},
		});

		// Update ticket status if needed (e.g., reopen if closed)
		if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
			await prisma.supportTicket.update({
				where: { id: params.id },
				data: { status: "OPEN", updatedAt: new Date() },
			});
		} else {
			await prisma.supportTicket.update({
				where: { id: params.id },
				data: { updatedAt: new Date() },
			});
		}

		// Fetch sender details for response
		const senderUser = {
			id: user.id,
			fullName: `${user.firstName} ${user.lastName}`,
			role: user.publicMetadata.role,
		};

		return NextResponse.json(
			{
				...message,
				senderUser,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error adding message to ticket:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
