import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		setupFiles: ["./src/features/vitest/setup.ts"],
		include: ["src/features/vitest/test/**/*.test.ts"],
	},
});
