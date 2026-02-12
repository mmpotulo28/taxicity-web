import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextFetchEvent, type NextRequest } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher(["/", "/auth/sign-in(.*)", "/auth/sign-up(.*)", "/apply(.*)", "/api/webhooks(.*)"]);

const middleware = clerkMiddleware(async (auth, req) => {
	// Protected routes require authentication
	if (!isPublicRoute(req)) {
		await auth.protect();
	}
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
	return middleware(request, event);
}

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
