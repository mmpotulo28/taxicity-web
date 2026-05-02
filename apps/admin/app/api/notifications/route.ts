import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@taxiciti/database";
import { pusherServer } from "../../../lib/pusher";
import { z } from "zod";

const createNotificationSchema = z.object({
	title: z.string().min(1),
	message: z.string().min(1),
	type: z.enum(["INFO", "SUCCESS", "WARNING", "ERROR", "TRIP_UPDATE", "PAYMENT"]),
	userId: z.string().optional(), // If missing, it's a broadcast
});

export async function POST(req: Request) {
	try {
		const { userId: adminId } = await auth();
		if (!adminId) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const body = await req.json();
		const validation = createNotificationSchema.safeParse(body);

		if (!validation.success) {
			return new NextResponse("Invalid data", { status: 400 });
		}

		const { title, message, type, userId } = validation.data;
		const targetUserId = userId || "ALL";

		// 1. Create Record
		const notification = await prisma.notification.create({
			data: {
				title,
				message,
				type,
				userId: targetUserId,
				isRead: false,
			},
		});

		// 2. Trigger Pusher
		if (targetUserId === "ALL") {
			// Broadcast Channel
			await pusherServer.trigger("notifications-global", "new-notification", notification);
		} else {
			// Targeted Channel
			await pusherServer.trigger(`user-${targetUserId}`, "new-notification", notification);
		}

		return NextResponse.json(notification);
	} catch (error) {
		console.error("[NOTIFICATIONS_POST]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}

export async function GET(_: Request) {
	try {
		const { userId } = await auth();
		if (!userId) return new NextResponse("Unauthorized", { status: 401 });

		// Get latest 50 notifications
		const notifications = await prisma.notification.findMany({
			orderBy: { createdAt: "desc" },
			take: 50,
		});

		return NextResponse.json(notifications);
	} catch (error) {
		console.error("[NOTIFICATIONS_GET]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
