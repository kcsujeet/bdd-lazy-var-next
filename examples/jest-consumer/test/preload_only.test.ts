// No import of bdd-lazy-var-next here, relying on preload
// No import of describe, expect, it here - use globals (not @jest/globals)
// bdd-lazy-var-next wraps the global describe/it/expect functions

describe("Consumer Project Preload Only", () => {
	def("bar", () => "baz");

	it("works with preload only", () => {
		expect(get("bar")).toBe("baz");
	});
});
