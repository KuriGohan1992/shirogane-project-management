import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ override: true, path: ".env.test.local" });

if (
	!process.env.CLERK_PUBLISHABLE_KEY &&
	process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
) {
	process.env.CLERK_PUBLISHABLE_KEY =
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

if (
	!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
	process.env.CLERK_PUBLISHABLE_KEY
) {
	process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
		process.env.CLERK_PUBLISHABLE_KEY;
}

if (process.env.TEST_DATABASE_URL) {
	process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: false,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? [["github"], ["html"]] : "list",
	use: {
		baseURL: "http://127.0.0.1:3100",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},
	webServer: {
		command: "pnpm exec next dev --port 3100",
		url: "http://127.0.0.1:3100",
		reuseExistingServer: false,
		timeout: 120_000,
	},
	projects: [
		{
			name: "setup",
			testMatch: /global\.setup\.ts/,
		},
		{
			name: "public",
			use: {
				...devices["Desktop Chrome"],
			},
			dependencies: ["setup"],
			testMatch: /public\.spec\.ts/,
		},
		{
			name: "authenticated",
			use: {
				...devices["Desktop Chrome"],
				storageState: "playwright/.clerk/user.json",
			},
			dependencies: ["setup"],
			testMatch: /authenticated\.spec\.ts/,
		},
	],
});
