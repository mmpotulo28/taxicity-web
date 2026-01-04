import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const CreateSupportTicketSchema = z.object({
	category: z.enum(["ACCOUNT_ISSUE", "PAYMENT_PROBLEM", "TECHNICAL_SUPPORT", "BOOKING_ISSUE", "DRIVER_COMPLAINT", "FEATURE_REQUEST", "BUG_REPORT", "OTHER"]),
	subject: z.string().min(5).max(200),
	description: z.string().min(10).max(5000),
	priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
	attachments: z.array(z.string().url()).optional(),
	contactMethod: z.enum(["EMAIL", "PHONE", "IN_APP"]).default("EMAIL"),
	phoneNumber: z.string().optional(),
});

const CreateSupportMessageSchema = z.object({
	message: z.string().min(1).max(5000),
	attachments: z.array(z.string().url()).optional(),
	isInternal: z.boolean().default(false),
});

const UpdateSupportTicketSchema = z.object({
	status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_FOR_USER", "RESOLVED", "CLOSED"]).optional(),
	priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
	assignedTo: z.string().optional(),
	category: z.enum(["ACCOUNT_ISSUE", "PAYMENT_PROBLEM", "TECHNICAL_SUPPORT", "BOOKING_ISSUE", "DRIVER_COMPLAINT", "FEATURE_REQUEST", "BUG_REPORT", "OTHER"]).optional(),
	resolution: z.string().max(2000).optional(),
});

// GET /api/support - Get support tickets
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
			// Staff can see all tickets or filter by parameters
			const status = searchParams.get("status");
			const category = searchParams.get("category");
			const priority = searchParams.get("priority");
			const assignedTo = searchParams.get("assignedTo");

			if (status) whereCondition.status = status;
			if (category) whereCondition.category = category;
			if (priority) whereCondition.priority = priority;
			if (assignedTo) whereCondition.assignedTo = assignedTo;
		} else {
			// Regular users can only see their own tickets
			whereCondition.userId = userId;
		}

		const [tickets, total] = await Promise.all([
			prisma.supportTicket.findMany({
				where: whereCondition,
				include: {
					messages: {
						orderBy: { createdAt: "asc" },
						take: 5, // Only get last 5 messages for listing
					},
					_count: {
						select: {
							messages: true,
						},
					},
				},
				orderBy: [{ updatedAt: "desc" }],
				skip,
				take: limit,
			}),
			prisma.supportTicket.count({ where: whereCondition }),
		]);

		// Fetch user details for tickets and messages
		const userIds = new Set<string>();
		tickets.forEach((ticket: any) => {
			if (ticket.userId) userIds.add(ticket.userId);
			if (ticket.assignedTo) userIds.add(ticket.assignedTo);
			ticket.messages.forEach((msg: any) => {
				if (msg.senderId) userIds.add(msg.senderId);
			});
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

		const enrichedTickets = tickets.map((ticket: any) => ({
			...ticket,
			user: ticket.userId ? usersMap.get(ticket.userId) : null,
			assignedToUser: ticket.assignedTo ? usersMap.get(ticket.assignedTo) : null,
			messages: ticket.messages.map((msg: any) => ({
				...msg,
				senderUser: msg.senderId ? usersMap.get(msg.senderId) : null,
			})),
		}));

		return NextResponse.json({
			tickets: enrichedTickets,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error fetching support tickets:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// POST /api/support - Create new support ticket
export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const parsed = CreateSupportTicketSchema.safeParse(body);

		if (!parsed.success) {
			console.error("Validation error:", parsed.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
		}

		// Generate ticket number
		const ticketCount = await prisma.supportTicket.count();
		const ticketNumber = `TXC-${(ticketCount + 1).toString().padStart(6, "0")}`;

		// Create the support ticket
		const ticket = await prisma.supportTicket.create({
			data: {
				...parsed.data,
				message: parsed.data.description,
				userId: userId,
				ticketNumber,
				status: "OPEN",
			},
		});

		// Create initial message
		await prisma.supportMessage.create({
			data: {
				ticketId: ticket.id,
				senderId: userId,
				message: parsed.data.description,
				attachments: parsed.data.attachments || [],
			},
		});

		// Fetch user details for response
		const client = await clerkClient();
		let user = null;
		try {
			const u = await client.users.getUser(userId);
			user = {
				id: u.id,
				fullName: `${u.firstName} ${u.lastName}`,
				email: u.emailAddresses[0]?.emailAddress,
			};
		} catch (e) {
			console.error("Error fetching user:", e);
		}

		return NextResponse.json(
			{
				...ticket,
				user,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating support ticket:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
