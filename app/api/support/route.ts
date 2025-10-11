import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const CreateSupportTicketSchema = z.object({
	category: z.enum([
		"ACCOUNT_ISSUE",
		"PAYMENT_PROBLEM",
		"TECHNICAL_SUPPORT",
		"BOOKING_ISSUE",
		"DRIVER_COMPLAINT",
		"FEATURE_REQUEST",
		"BUG_REPORT",
		"OTHER",
	]),
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
			// Staff can see all tickets or filter by parameters
			const status = searchParams.get("status");
			const category = searchParams.get("category");
			const priority = searchParams.get("priority");
			const assignedTo = searchParams.get("assignedTo");

			if (status) whereCondition.status = status;
			if (category) whereCondition.category = category;
			if (priority) whereCondition.priority = priority;
			if (assignedTo) whereCondition.assignedToId = assignedTo;
		} else {
			// Regular users can only see their own tickets
			whereCondition.userId = user.id;
		}

		const [tickets, total] = await Promise.all([
			prisma.supportTicket.findMany({
				where: whereCondition,
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
						select: {
							id: true,
							message: true,
							createdAt: true,
							isFromUser: true,
							isInternal: true,
							author: {
								select: {
									id: true,
									firstName: true,
									lastName: true,
								},
							},
						},
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

		return NextResponse.json({
			tickets,
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
			return NextResponse.json(
				{ error: "Invalid data", details: parsed.error.issues },
				{ status: 400 },
			);
		}

		// Get user information
		const user = await prisma.user.findUnique({
			where: { clerkId: userId },
			select: { id: true, firstName: true, lastName: true, email: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Generate ticket number
		const ticketCount = await prisma.supportTicket.count();
		const ticketNumber = `TXC-${(ticketCount + 1).toString().padStart(6, "0")}`;

		// Create the support ticket
		const ticket = await prisma.supportTicket.create({
			data: {
				...parsed.data,
				userId: user.id,
				ticketNumber,
				status: "OPEN",
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
			},
		});

		// Create initial message
		await prisma.supportMessage.create({
			data: {
				ticketId: ticket.id,
				authorId: user.id,
				message: parsed.data.description,
				isFromUser: true,
				attachments: parsed.data.attachments || [],
			},
		});

		return NextResponse.json(ticket, { status: 201 });
	} catch (error) {
		console.error("Error creating support ticket:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
