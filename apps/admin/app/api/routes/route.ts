import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxicity/database";
import { auth } from "@clerk/nextjs/server";

export async function GET(_req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const routes = await prisma.route.findMany({
			include: {
				sourceRank: true,
				destRank: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return NextResponse.json(routes);
	} catch (error) {
		console.error("Error fetching routes:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
