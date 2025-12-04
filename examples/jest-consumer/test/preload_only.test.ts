import { describe, expect, it } from "@jest/globals";

// No import of bdd-lazy-var-next here, relying on preload

describe("Consumer Project Preload Only", () => {
	def("bar", () => "baz");

	it("works with preload only", () => {
		expect(get("bar")).toBe("baz");
	});
});
