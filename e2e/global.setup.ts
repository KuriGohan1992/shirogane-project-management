import fs from "node:fs";
import path from "node:path";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { expect, test as setup } from "@playwright/test";

setup.describe.configure({ mode: "serial" });

const authFile = path.join(process.cwd(), "playwright", ".clerk", "user.json");

setup("configure Clerk testing", async () => {
	if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
		throw new Error(
			"Playwright requires Clerk development keys in .env.test.local.",
		);
	}

	await clerkSetup();
});

setup("authenticate Shiro test user", async ({ page }) => {
	const email = process.env.E2E_CLERK_USER_EMAIL;

	if (!email) {
		throw new Error("E2E_CLERK_USER_EMAIL is required in .env.test.local.");
	}

	fs.mkdirSync(path.dirname(authFile), { recursive: true });

	await page.goto("/");

	await clerk.signIn({
		page,
		emailAddress: email,
	});

	await page.goto("/dashboard");
	await expect(
		page.getByRole("heading", { name: "Dashboard", level: 1 }),
	).toBeVisible();

	await page.context().storageState({ path: authFile });
});
