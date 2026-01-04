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
				taxis: {
					include: {
						routes: {
							where: { isActive: true },
							include: {
								route: true,
							},
						},
					},
				},
			},
		});

		// If no driver found, check if we can link by email (migration path)
		if (!driver && user.emailAddresses[0]?.emailAddress) {
			const email = user.emailAddresses[0].emailAddress;
			driver = await prisma.driver.findUnique({
				where: { email },
				include: {
					taxis: {
						include: {
							routes: {
								where: { isActive: true },
								include: {
									route: true,
								},
							},
						},
					},
				},
			});

			if (driver) {
				// Link the account
				driver = await prisma.driver.update({
					where: { id: driver.id },
					data: { userId },
					include: {
						taxis: {
							include: {
								routes: {
									where: { isActive: true },
									include: {
										route: true,
									},
								},
							},
						},
					},
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

		// Update taxi status if isOnline is provided
		if (typeof isOnline === "boolean") {
			if (isOnline) {
				// Set taxis to AVAILABLE (unless in MAINTENANCE)
				await prisma.taxi.updateMany({
					where: {
						driverId: driver.id,
						status: { not: "MAINTENANCE" },
					},
					data: { status: "AVAILABLE" },
				});
			} else {
				// Set taxis to OFFLINE
				await prisma.taxi.updateMany({
					where: { driverId: driver.id },
					data: { status: "OFFLINE" },
				});
			}
		}

		return NextResponse.json(driver);
	} catch (error) {
		console.error("Error updating driver:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
