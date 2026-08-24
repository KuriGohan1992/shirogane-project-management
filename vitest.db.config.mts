import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./", import.meta.url)),
			"server-only": fileURLToPath(
				new URL("./tests/stubs/server-only.ts", import.meta.url),
			),
		},
	},
	test: {
		environment: "node",
		fileParallelism: false,
		hookTimeout: 30_000,
		include: ["tests/database/**/*.test.ts"],
		setupFiles: ["./tests/database/setup.ts"],
		testTimeout: 30_000,
	},
});
