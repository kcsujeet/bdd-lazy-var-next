import { describe, it, expect } from "bun:test";

// No import of bdd-lazy-var-next here, relying on preload

describe("Consumer Project Preload Only", () => {
  def("bar", "baz");

  it("works with preload only", () => {
    expect(get("bar")).toBe("baz");
  });
});
