import * as assert from "assert";

declare var def: any;
declare var subject: any;
declare var get: any;

describe("Mocha Native Usage", () => {
	def("value", () => 1);
	subject(() => get("value") + 1);

	it("works with native assertions", () => {
		assert.strictEqual(get("subject"), 2);
	});

	describe("nested", () => {
		def("value", () => 10);

		it("respects scoping", () => {
			assert.strictEqual(get("subject"), 11);
		});
	});
});
