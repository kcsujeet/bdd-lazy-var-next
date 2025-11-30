import { describe, it, expect } from "vitest";
import { def, get } from "bdd-lazy-var-next/vitest";

def("foo", "bar");

describe("Vite Consumer Basic", () => {
  it("returns correct value", () => {
    expect(get("foo")).toBe("bar");
  });
});
