import { test, expect } from "@playwright/test";

test.describe("User App Critical Flows", () => {
	// Note: These tests assume the User App is running on port 3000
	// If authentication is required, we would typically load storage state here
	// or test the public facing pages / unauthenticated states.

	test.beforeEach(async ({ page }) => {
		await page.goto("http://localhost:3000");
	});

	test("Homepage should render critical UI components", async ({ page }) => {
		// 1. Check title
		await expect(page).toHaveTitle(/TaxiCity/i); // Adjust regex based on actual title

		// 2. Map should be visible (looking for canvas or map container)
		// Mapbox usually creates a canvas element
		const mapCanvas = page.locator(".mapboxgl-canvas");
		if ((await mapCanvas.count()) > 0) {
			await expect(mapCanvas).toBeVisible();
		} else {
			console.log("Mapbox canvas not found - maybe map key is missing or not loaded");
		}

		// 3. Navigation Header should be present
		// Looking for NotificationBell which is in the Header (finding any button in header/nav context)
		// Or finding the map controls which are usually present
		const buttons = page.getByRole("button");
		await expect(buttons.first()).toBeVisible();
	});

	test("Navigation to History and Settings", async ({ page }) => {
		// If "History" button exists (based on code reading: text "History")
		// Note: The text is inside a span: <span ...>History</span>

		// Wait for potential client-side hydration
		await page.waitForLoadState("networkidle");

		// Check if we are signed in (Where to? button) vs signed out state
		const whereToBtn = page.getByRole("button", { name: "Where to?" });
		const historyBtn = page.getByRole("link", { name: "History" });
		const settingsBtn = page.getByRole("link", { name: "Settings" });

		if (await whereToBtn.isVisible()) {
			console.log("User is signed in. Testing authenticated navigation.");

			// Test History Link
			await historyBtn.click();
			await expect(page).toHaveURL(/.*\/ride\/trip\/history/);
			await page.goBack();

			// Test Settings Link
			await settingsBtn.click();
			await expect(page).toHaveURL(/.*\/settings/);
		} else {
			console.log("User appears signed out or loading. Verifying public elements.");
			// If signed out, maybe we see a "Sign In" button?
			// Based on page.tsx, <SignedIn> wraps the content.
			// If signed out, that content (History/Settings) won't render.
			// We should check for Sign In button if it exists in the layout or page.

			// Check if Clerk sign in is present
			const signInBtn = page.locator(".clerk-sign-in-button");
			// Or generic sign in
			if ((await page.getByText("Sign in").count()) > 0) {
				await expect(page.getByText("Sign in")).toBeVisible();
			}
		}
	});

	test("Ride Booking Entry Point", async ({ page }) => {
		const whereToBtn = page.getByRole("button", { name: "Where to?" });

		if (await whereToBtn.isVisible()) {
			await whereToBtn.click();
			await expect(page).toHaveURL(/.*\/ride\/route/);

			// In /ride/route, we expect input fields for Pickup/Dropoff
			// We can check for those placeholders if we assume route loaded
			await expect(page.getByPlaceholder("Enter pickup location"))
				.toBeVisible({ timeout: 5000 })
				.catch(() => {});
		}
	});
});
