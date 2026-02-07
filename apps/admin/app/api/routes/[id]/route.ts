import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxiciti/database";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const route = await prisma.route.findUnique({
			where: { id: params.id },
			include: {
				sourceRank: true,
				destRank: true,
				popularLocations: true,
			},
		});

		if (!route) {
			return NextResponse.json({ error: "Route not found" }, { status: 404 });
		}

		return NextResponse.json(route);
	} catch (error) {
		console.error("Error fetching route:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		// Extract fields that are allowed to be updated
		const { name, description, baseFare, polyline, distance, estimatedDuration, status } = body;

		// If popularLocations are provided, we might need complex handling
		// For now, let's focus on updating basic fields + polyline if provided

		const updatedRoute = await prisma.route.update({
			where: { id: params.id },
			data: {
				name,
				description,
				baseFare: baseFare ? Number(baseFare) : undefined,
				polyline,
				distance: distance ? Number(distance) : undefined,
				estimatedDuration: estimatedDuration ? Number(estimatedDuration) : undefined,
				status,
			},
			include: {
				sourceRank: true,
				destRank: true,
			},
		});

		return NextResponse.json(updatedRoute);
	} catch (error) {
		console.error("Error updating route:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await prisma.route.delete({
			where: { id: params.id },
		});

		return NextResponse.json({ message: "Route deleted successfully" });
	} catch (error) {
		console.error("Error deleting route:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
