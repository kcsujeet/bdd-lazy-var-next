import { describe, expect, it } from "vitest";

// No import of bdd-lazy-var-next here, relying on preload

def("foo", () => "bar");

describe("Consumer Project Preload Only", () => {
	def("bar", () => "baz");

	it("works with preload only", () => {
		expect(get("bar")).toBe("baz");
		expect(get("foo")).toBe("bar");
	});
});
