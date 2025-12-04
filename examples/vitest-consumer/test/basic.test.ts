import { def, get } from "bdd-lazy-var-next/vitest";
import { describe, expect, it } from "vitest";

def("foo", () => "bar");

describe("Vite Consumer Basic", () => {
	it("returns correct value", () => {
		expect(get("foo")).toBe("bar");
	});
});
