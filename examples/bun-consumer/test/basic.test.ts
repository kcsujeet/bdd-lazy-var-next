import { describe, it, expect } from "bun:test";
import { def, get } from "bdd-lazy-var-next/bun";

def("foo", "bar");

describe("Vite Consumer Basic", () => {
  it("returns correct value", () => {
    expect(get("foo")).toBe("bar");
  });
});
