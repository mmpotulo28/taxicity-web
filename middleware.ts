import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
	"/",
	"/sign-in(.*)",
	"/sign-up(.*)",
	"/api/webhooks(.*)",
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher(["/ride(.*)", "/settings(.*)", "/support(.*)"]);

export default clerkMiddleware((auth, req) => {
	// Protected routes require authentication
	if (isProtectedRoute(req) && !isPublicRoute(req)) {
	}
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
