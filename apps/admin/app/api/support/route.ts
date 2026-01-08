import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxicity/database";
import { auth } from "@clerk/nextjs/server";

export async function GET(_req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const tickets = await prisma.supportTicket.findMany({
			include: {
				messages: {
					orderBy: {
						createdAt: "asc",
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(tickets);
	} catch (error) {
		console.error("Error fetching support tickets:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
