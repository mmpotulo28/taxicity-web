import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const notifications = await prisma.notification.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json(notifications);
	} catch (error) {
		console.error("Error fetching notifications:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const body = await req.json();
		const { id } = body;

		if (id) {
			// Mark single as read
			await prisma.notification.update({
				where: { id },
				data: { isRead: true },
			});
		} else {
			// Mark all as read
			await prisma.notification.updateMany({
				where: { userId, isRead: false },
				data: { isRead: true },
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating notifications:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
