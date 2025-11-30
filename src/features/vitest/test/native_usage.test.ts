import "../../../../dist/vitest";
import { beforeEach, describe, expect, it } from "vitest";

declare const def: any;
declare const subject: any;
declare const get: any;

describe("Vitest Native Usage", () => {
	def("value", () => 42);
	def("obj", () => ({ id: 1 }));
	subject(() => "main subject");

	it("works with native expect and get()", () => {
		expect(get("value")).toBe(42);
		expect(get("obj")).toEqual({ id: 1 });
		expect(get("subject")).toBe("main subject");
	});

	describe("nested context", () => {
		def("value", () => 100);

		it("respects overrides", () => {
			expect(get("value")).toBe(100);
		});

		it("inherits other values", () => {
			expect(get("obj")).toEqual({ id: 1 });
		});
	});

	describe("dependent variables", () => {
		def("base", () => 10);
		def("derived", () => get("base") * 2);

		it("can access other variables", () => {
			expect(get("derived")).toBe(20);
		});

		describe("with override", () => {
			def("base", () => 5);

			it("recalculates dependent variable", () => {
				expect(get("derived")).toBe(10);
			});
		});
	});

	describe("named subjects", () => {
		subject("user", () => ({ name: "Alice" }));

		it("is accessible by name", () => {
			expect(get("user")).toEqual({ name: "Alice" });
		});

		it("is accessible as subject", () => {
			expect(get("subject")).toEqual({ name: "Alice" });
		});
	});

	describe("lazy evaluation and caching", () => {
		let factoryCalls = 0;

		beforeEach(() => {
			factoryCalls = 0;
		});

		def("expensive", () => {
			factoryCalls++;
			return "done";
		});

		it("does not evaluate until accessed", () => {
			expect(factoryCalls).toBe(0);
			get("expensive");
			expect(factoryCalls).toBe(1);
		});

		it("caches the value within the test", () => {
			get("expensive");
			get("expensive");
			expect(factoryCalls).toBe(1);
		});

		it("resets cache between tests", () => {
			// factoryCalls is reset to 0 by beforeEach
			get("expensive");
			expect(factoryCalls).toBe(1);
		});
	});
});
