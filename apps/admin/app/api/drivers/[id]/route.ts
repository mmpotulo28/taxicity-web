import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@taxiciti/database";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!id) {
			return NextResponse.json({ error: "Driver ID is required" }, { status: 400 });
		}

		const body = await req.json();
		// Extract fields that are allowed to be updated directly
		const { firstName, lastName, phone, licenseNumber, licenseExpiry, status, email } = body;

		const updatedDriver = await prisma.driver.update({
			where: { id },
			data: {
				...(firstName && { firstName }),
				...(lastName && { lastName }),
				...(phone && { phone }),
				...(email && { email }),
				...(licenseNumber && { licenseNumber }),
				...(licenseExpiry && { licenseExpiry: new Date(licenseExpiry) }),
				...(status && { status }),
			},
		});

		return NextResponse.json(updatedDriver);
	} catch (error) {
		console.error("Error updating driver:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!id) {
			return NextResponse.json({ error: "Driver ID is required" }, { status: 400 });
		}

		await prisma.driver.delete({
			where: { id },
		});

		return NextResponse.json({ message: "Driver deleted successfully" });
	} catch (error) {
		console.error("Error deleting driver:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
