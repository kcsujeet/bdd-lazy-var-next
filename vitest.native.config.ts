import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/features/vitest/test/native_usage.test.ts"],
	},
});
