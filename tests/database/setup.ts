import { config } from "dotenv";
import { afterAll, beforeAll } from "vitest";

config({ path: ".env.local" });
config({ override: true, path: ".env.test.local" });

const applicationDatabaseUrl = process.env.DATABASE_URL;
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
	throw new Error(
		"TEST_DATABASE_URL is required for database tests. Copy .env.test.example to .env.test.local.",
	);
}

if (process.env.ALLOW_TEST_DATABASE_RESET !== "true") {
	throw new Error(
		"Database tests are destructive. Set ALLOW_TEST_DATABASE_RESET=true in .env.test.local after verifying TEST_DATABASE_URL is a dedicated test database.",
	);
}

if (applicationDatabaseUrl && applicationDatabaseUrl === testDatabaseUrl) {
	throw new Error("TEST_DATABASE_URL must not be the same as DATABASE_URL.");
}

process.env.DATABASE_URL = testDatabaseUrl;

async function cleanTestData() {
	const { like } = await import("drizzle-orm");
	const { db } = await import("@/lib/db");
	const { users } = await import("@/lib/db/schema");

	await db.delete(users).where(like(users.clerkId, "test_%"));
}

beforeAll(async () => {
	await cleanTestData();
});

afterAll(async () => {
	await cleanTestData();
});
