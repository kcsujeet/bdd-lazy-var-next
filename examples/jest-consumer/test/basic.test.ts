import { def, get } from "bdd-lazy-var-next/jest";

def("foo", () => "bar");

describe("Jest Consumer Basic", () => {
  it("returns correct value", () => {
    expect(get("foo")).toBe("bar");
  });
});
