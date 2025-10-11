import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

// Validation schemas
const CreateUserSchema = z.object({
	email: z.string().email(),
	phone: z.string().optional(),
	fullName: z.string().min(1),
	profileImage: z.string().optional(),
	deviceToken: z.string().optional(),
});

const UpdateUserSchema = z.object({
	phone: z.string().optional(),
	fullName: z.string().min(1).optional(),
	profileImage: z.string().optional(),
	deviceToken: z.string().optional(),
});

// GET /api/users - Get all users (admin only) or current user profile
export async function GET(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const url = new URL(req.url);
		const getAllUsers = url.searchParams.get("all") === "true";

		if (getAllUsers) {
			// TODO: Add admin role check here
			const users = await prisma.user.findMany({
				select: {
					id: true,
					email: true,
					fullName: true,
					phone: true,
					profileImage: true,
					createdAt: true,
					updatedAt: true,
					_count: {
						select: {
							trips: true,
							tripRatings: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});

			return NextResponse.json(users);
		}

		// Get current user profile
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				savedLocations: true,
				emergencyContacts: true,
				lastKnownLocation: true,
				_count: {
					select: {
						trips: true,
						tripRatings: true,
						favoriteDrivers: true,
					},
				},
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(user);
	} catch (error) {
		console.error("Error fetching users:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// POST /api/users - Create a new user (typically called during registration)
export async function POST(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const parsed = CreateUserSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid data", details: parsed.error.issues },
				{ status: 400 },
			);
		}

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (existingUser) {
			return NextResponse.json({ error: "User already exists" }, { status: 409 });
		}

		// Create the user with Clerk userId as the primary key
		const user = await prisma.user.create({
			data: {
				id: userId,
				...parsed.data,
				passwordHash: "", // Not used with Clerk
			},
			include: {
				savedLocations: true,
				emergencyContacts: true,
			},
		});

		return NextResponse.json(user, { status: 201 });
	} catch (error) {
		console.error("Error creating user:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// PUT /api/users - Update current user profile
export async function PUT(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const parsed = UpdateUserSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid data", details: parsed.error.issues },
				{ status: 400 },
			);
		}

		const user = await prisma.user.update({
			where: { id: userId },
			data: parsed.data,
			include: {
				savedLocations: true,
				emergencyContacts: true,
				lastKnownLocation: true,
			},
		});

		return NextResponse.json(user);
	} catch (error) {
		console.error("Error updating user:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// DELETE /api/users - Delete current user account
export async function DELETE(req: NextRequest) {
	try {
		const { userId } = getAuth(req);

		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Delete user and all related data (CASCADE relationships will handle cleanup)
		await prisma.user.delete({
			where: { id: userId },
		});

		return NextResponse.json({ message: "User deleted successfully" });
	} catch (error) {
		console.error("Error deleting user:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
