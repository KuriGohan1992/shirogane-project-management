import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../lib/db/schema";
import { notifications, projects, users } from "../lib/db/schema";

config({ path: ".env.production.local" });

function getRequiredEnv(name: string) {
	const value = process.env[name]?.trim();

	if (!value) {
		throw new Error(`${name} is missing or empty in .env.production.local.`);
	}

	return value;
}

async function main() {
	const productionDatabaseUrl = getRequiredEnv("PRODUCTION_DATABASE_URL");
	const parsedUrl = new URL(productionDatabaseUrl);

	const sqlClient = neon(productionDatabaseUrl);
	const db = drizzle({
		client: sqlClient,
		schema,
	});

	const rl = createInterface({
		input,
		output,
	});

	try {
		console.log("\n⚠️  PRODUCTION DEMO DATA RESET");
		console.log(`Host: ${parsedUrl.hostname}`);
		console.log(`Database: ${parsedUrl.pathname.slice(1)}`);

		console.log(
			"This deletes every project in this production database and all project-owned stages, tasks, labels, comments, memberships, activity, and project notifications through foreign-key cascades.",
		);

		console.log(
			"It also removes seed-generated users and clears remaining notifications, but preserves real Clerk-synchronized user rows so you can immediately sign in and see the empty state.\n",
		);

		const confirmation = await rl.question(
			'Type "CLEAR SHIRO DEMO DATA" to continue: ',
		);

		if (confirmation !== "CLEAR SHIRO DEMO DATA") {
			console.log("\nReset cancelled. Nothing was deleted.");
			return;
		}

		await db.delete(notifications);
		await db.delete(projects);
		await db.delete(users).where(like(users.clerkId, "seed_clerk_%"));

		console.log(
			"\nProduction demo data cleared. Your real Clerk-synchronized users were preserved.\n",
		);
	} finally {
		rl.close();
	}
}

main().catch((error) => {
	console.error("\nFailed to clear production demo data:", error);
	process.exitCode = 1;
});
