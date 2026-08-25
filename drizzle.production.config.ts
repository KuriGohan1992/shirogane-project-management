import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.production.local", override: true });

const productionDatabaseUrl = process.env.PRODUCTION_DATABASE_URL;

if (!productionDatabaseUrl) {
	throw new Error(
		"PRODUCTION_DATABASE_URL is not defined. Add it to .env.production.local.",
	);
}

export default defineConfig({
	schema: "./lib/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: productionDatabaseUrl,
	},
});