import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxiciti/database";
import { auth } from "@clerk/nextjs/server";

export async function GET(_req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const taxis = await prisma.taxi.findMany({
			include: {
				driver: true,
				routes: true,
				currentLocation: true,
				queueEntry: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(taxis);
	} catch (error) {
		console.error("Error fetching taxis:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
