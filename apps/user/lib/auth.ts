import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function isAdmin() {
	const { userId } = await auth();
	if (!userId) return false;

	try {
		const client = await clerkClient();
		const user = await client.users.getUser(userId);
		return user.publicMetadata.role === "admin";
	} catch (error) {
		console.error("Error checking admin status:", error);
		return false;
	}
}

export function unauthorizedResponse() {
	return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
}
