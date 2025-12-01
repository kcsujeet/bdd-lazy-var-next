import { describe, it, expect, mock } from "bun:test";
import { def, get } from "bdd-lazy-var-next/bun";

def("foo", () => "bar");
def("func", () => mock(() => "baz"));

describe("Vite Consumer Basic", () => {
  it("returns correct value", () => {
    expect(get("foo")).toBe("bar");
  });

  it("mocks function correctly", () => {
    const res = get("func")();
    expect(res).toBe("baz");
    expect(get("func")).toHaveBeenCalled();
    expect(get("func")).toHaveBeenCalledTimes(1);
  });

  it("allows multiple calls to mocked function", () => {
    get("func")();
    get("func")();
    expect(get("func")).toHaveBeenCalledTimes(2);
  });
});
