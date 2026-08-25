import { spawnSync } from "node:child_process";

import { config } from "dotenv";

config({ path: ".env.production.local" });

function getRequiredEnv(name: string) {
	const value = process.env[name]?.trim();

	if (!value) {
		throw new Error(`${name} is missing or empty in .env.production.local.`);
	}

	return value;
}

const productionDatabaseUrl = getRequiredEnv("PRODUCTION_DATABASE_URL");
const productionSeedUserEmail = getRequiredEnv("PRODUCTION_SEED_USER_EMAIL");
const parsedUrl = new URL(productionDatabaseUrl);

console.log("\nSeeding PRODUCTION Shiro data");
console.log(`Host: ${parsedUrl.hostname}`);
console.log(`Database: ${parsedUrl.pathname.slice(1)}`);
console.log(`Seed user: ${productionSeedUserEmail}\n`);

const result = spawnSync("pnpm", ["db:seed"], {
	stdio: "inherit",
	env: {
		...process.env,
		DATABASE_URL: productionDatabaseUrl,
		SEED_USER_EMAIL: productionSeedUserEmail,
		NODE_ENV: "production",
		ALLOW_PRODUCTION_SEED: "true",
	},
});

if (result.error) {
	throw result.error;
}

if (result.status !== 0) {
	process.exit(result.status ?? 1);
}
