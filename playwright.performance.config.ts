import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env.local" });

const benchmarkDatabaseUrl = process.env.DATABASE_URL;

config({ override: true, path: ".env.test.local" });

if (benchmarkDatabaseUrl) {
	process.env.DATABASE_URL = benchmarkDatabaseUrl;
}

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

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: false,
	workers: 1,
	retries: 0,
	reporter: "list",
	use: {
		baseURL: "http://127.0.0.1:3100",
		trace: "off",
		screenshot: "off",
		video: "off",
	},
	webServer: {
		command: "pnpm exec next start --port 3100",
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
			name: "performance",
			use: {
				...devices["Desktop Chrome"],
				storageState: "playwright/.clerk/user.json",
			},
			dependencies: ["setup"],
			testMatch: /performance\.spec\.ts/,
		},
	],
});
