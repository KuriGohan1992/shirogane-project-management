import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.test.local" });

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
	throw new Error(
		"TEST_DATABASE_URL is not defined. Add it to .env.test.local.",
	);
}

export default defineConfig({
	schema: "./lib/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: testDatabaseUrl,
	},
});
