import { NextRequest, NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { isAdmin, unauthorizedResponse } from "@/lib/auth";

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
	firstName: z.string().optional(),
	lastName: z.string().optional(),
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
		const client = await clerkClient();

		if (getAllUsers) {
			const isUserAdmin = await isAdmin();
			if (!isUserAdmin) {
				return unauthorizedResponse();
			}

			// Fetch users from Clerk
			const users = await client.users.getUserList({
				orderBy: "-created_at",
				limit: 100,
			});

			const mappedUsers = users.data.map((u) => ({
				id: u.id,
				email: u.emailAddresses[0]?.emailAddress,
				fullName: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
				phone: u.phoneNumbers[0]?.phoneNumber,
				profileImage: u.imageUrl,
				createdAt: new Date(u.createdAt),
				updatedAt: new Date(u.updatedAt),
				role: u.publicMetadata.role,
			}));

			return NextResponse.json(mappedUsers);
		}

		// Get current user profile from Clerk
		const user = await client.users.getUser(userId);

		// Fetch related data from Prisma
		const [savedLocations, emergencyContacts, lastKnownLocation, tripCount, ratingCount, favDriverCount] = await Promise.all([
			prisma.savedLocation.findMany({ where: { userId } }),
			prisma.emergencyContact.findMany({ where: { userId } }),
			prisma.userLocation.findUnique({ where: { userId } }),
			prisma.trip.count({ where: { userId } }),
			prisma.tripRating.count({ where: { userId } }),
			prisma.favoriteDriver.count({ where: { userId } }),
		]);

		const userData = {
			id: user.id,
			email: user.emailAddresses[0]?.emailAddress,
			fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
			phone: user.phoneNumbers[0]?.phoneNumber,
			profileImage: user.imageUrl,
			createdAt: new Date(user.createdAt),
			updatedAt: new Date(user.updatedAt),
			role: user.publicMetadata.role,
			savedLocations,
			emergencyContacts,
			lastKnownLocation,
			_count: {
				trips: tripCount,
				tripRatings: ratingCount,
				favoriteDrivers: favDriverCount,
			},
		};

		return NextResponse.json(userData);
	} catch (error) {
		console.error("Error fetching users:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// POST /api/users - Create a new user (Managed by Clerk)
export async function POST(req: NextRequest) {
	return NextResponse.json({ message: "User management is handled by Clerk" }, { status: 200 });
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
			console.error("Validation error:", parsed.error.issues);
			return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
		}

		const client = await clerkClient();
		const updateData: any = {};

		if (parsed.data.firstName) updateData.firstName = parsed.data.firstName;
		if (parsed.data.lastName) updateData.lastName = parsed.data.lastName;

		// Handle fullName split if provided
		if (parsed.data.fullName) {
			const parts = parsed.data.fullName.split(" ");
			if (parts.length > 0) {
				updateData.firstName = parts[0];
				if (parts.length > 1) {
					updateData.lastName = parts.slice(1).join(" ");
				}
			}
		}

		// Update Clerk user if there are changes
		if (Object.keys(updateData).length > 0) {
			await client.users.updateUser(userId, updateData);
		}

		// Return updated user data
		const user = await client.users.getUser(userId);
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

		const client = await clerkClient();
		await client.users.deleteUser(userId);

		// Cleanup Prisma data
		await Promise.all([
			prisma.savedLocation.deleteMany({ where: { userId } }),
			prisma.emergencyContact.deleteMany({ where: { userId } }),
			prisma.userLocation.deleteMany({ where: { userId } }),
			prisma.routePreference.deleteMany({ where: { userId } }),
			prisma.favoriteDriver.deleteMany({ where: { userId } }),
			// We might want to keep trips for records, or anonymize them
		]);

		return NextResponse.json({ message: "User deleted successfully" });
	} catch (error) {
		console.error("Error deleting user:", error);

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
