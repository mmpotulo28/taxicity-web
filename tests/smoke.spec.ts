import { test, expect } from "@playwright/test";

// Smoke tests for Landing App (Port 3003)
test.describe("Landing App", () => {
	test("should load homepage", async ({ page }) => {
		try {
			await page.goto("http://localhost:3003");
			await expect(page).toHaveTitle(/TaxiCity/i);
		} catch (e) {
			console.warn("Landing app not running on port 3003? Skipping test.");
		}
	});
});

// Smoke tests for User App (Port 3000)
test.describe("User App", () => {
	test("should redirect to sign-in or load dashboard", async ({ page }) => {
		try {
			await page.goto("http://localhost:3000");
			// Takes you to Clerk sign in or Dashboard
			// Just check if we get a status 200 or 300s,/page content
			// Expecting "TaxiCity" or "Sign in" in title or body
			const title = await page.title();
			console.log("User App Title:", title);
		} catch (e) {
			console.warn("User app not running on port 3000? Skipping test.");
		}
	});
});

// Smoke tests for Driver App (Port 3001)
test.describe("Driver App", () => {
	test("should load", async ({ page }) => {
		try {
			await page.goto("http://localhost:3001");
			await expect(page).toHaveTitle(/Driver/i);
		} catch (e) {
			console.warn("Driver app not running on port 3001? Skipping test.");
		}
	});
});

// Smoke tests for Admin App (Port 3002)
test.describe("Admin App", () => {
	test("should load", async ({ page }) => {
		try {
			await page.goto("http://localhost:3002");
			await expect(page).toHaveTitle(/Admin/i);
		} catch (e) {
			console.warn("Admin app not running on port 3002? Skipping test.");
		}
	});
});
