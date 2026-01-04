import { NextRequest, NextResponse } from "next/server";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		const user = await currentUser();

		if (!userId || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Find driver by userId
		let driver = await prisma.driver.findUnique({
			where: { userId },
			include: {
				taxis: true,
			},
		});

		// If no driver found, check if we can link by email (migration path)
		if (!driver && user.emailAddresses[0]?.emailAddress) {
			const email = user.emailAddresses[0].emailAddress;
			driver = await prisma.driver.findUnique({
				where: { email },
				include: { taxis: true },
			});

			if (driver) {
				// Link the account
				driver = await prisma.driver.update({
					where: { id: driver.id },
					data: { userId },
					include: { taxis: true },
				});
			}
		}

		// If still no driver, return 404 so the frontend knows to redirect to application
		if (!driver) {
			return NextResponse.json({ error: "Driver not found" }, { status: 404 });
		}

		return NextResponse.json(driver);
	} catch (error) {
		console.error("Error fetching driver:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const { userId } = getAuth(req);
		if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const body = await req.json();
		const { status, isOnline } = body;

		// Update driver status
		// Note: We might want to add an 'isOnline' field to the schema later
		// For now we map isOnline to status if needed, or just handle status

		const driver = await prisma.driver.update({
			where: { userId },
			data: {
				status: status || undefined,
				// Add other fields as needed
			},
		});

		return NextResponse.json(driver);
	} catch (error) {
		console.error("Error updating driver:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
