import { describe, expect, it } from "bun:test";

// No import of bdd-lazy-var-next here, relying on preload

describe("Consumer Project Preload Only", () => {
	def("bar", () => "baz");

	it("works with preload only", () => {
		// Use explicit type parameter for type safety
		const bar = get<string>("bar");
		expect(bar).toBe("baz");
	});
});
