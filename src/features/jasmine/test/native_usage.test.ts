import "../../../../dist/index";

declare const def: any;
declare const subject: any;
declare const get: any;

describe("Jasmine Native Usage", () => {
	def("value", () => 42);
	def("obj", () => ({ id: 1 }));
	subject(() => "main subject");

	it("works with native expect and get()", () => {
		expect(get("value")).toBe(42);
		expect(get("obj")).toEqual({ id: 1 });
		expect(get("subject")).toBe("main subject");
	});

	describe("nested context", () => {
		def("nestedValue", () => 100);

		it("respects overrides", () => {
			expect(get("nestedValue")).toBe(100);
		});

		it("inherits other values", () => {
			expect(get("obj")).toEqual({ id: 1 });
		});
	});
});
