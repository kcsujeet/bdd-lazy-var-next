import { expect } from "chai";

declare const describe: any;
declare const it: any;
declare const sharedExamplesFor: any;
declare const includeExamplesFor: any;
declare const itBehavesLike: any;
declare const spy: any;

describe("Shared behavior", () => {
	describe("`sharedExamplesFor`", () => {
		var defineError: any;

		sharedExamplesFor("__test", () => {});

		try {
			sharedExamplesFor("__test", () => {});
		} catch (error) {
			defineError = error;
		}

		it("throws error when trying to redefine existing shared examples", () => {
			expect(defineError.message).to.match(/Attempt to override/);
		});
	});

	describe("`includeExamplesFor`", () => {
		var includeError: any;
		var examples = spy();
		var args = [{}, {}];
		var fnDefinition = spy();

		try {
			includeExamplesFor("__non_existing");
		} catch (error) {
			includeError = error;
		}

		sharedExamplesFor("__call", examples);
		includeExamplesFor("__call", args[0], args[1]);
		includeExamplesFor(fnDefinition, args[0]);

		it("throws error when trying to include non-existing shared examples", () => {
			expect(includeError.message).to.match(/not defined shared behavior/);
		});

		it("calls registered shared examples with specified arguments", () => {
			expect(examples).to.have.been.called.with.exactly(args[0], args[1]);
		});

		it("accepts function as the 1st argument and call it", () => {
			expect(fnDefinition).to.have.been.called.with.exactly(args[0]);
		});
	});

	describe("`itBehavesLike`", () => {
		var examples = spy(() => {
			if (typeof it === "function") {
				it("dummy", () => {});
			}
		});
		var args = [{}, {}];
		var spiedDescribe = spy.on(global, "describe");
		var fnBehavior = spy(() => {
			if (typeof it === "function") {
				it("dummy", () => {});
			}
		});

		sharedExamplesFor("__Collection", examples);
		itBehavesLike("__Collection", args[0], args[1]);
		spy.restore(global, "describe");

		itBehavesLike(fnBehavior, args[0]);

		it("includes examples in a nested context", () => {
			expect(spiedDescribe).to.have.been.called.with(
				"behaves like __Collection",
			);
			expect(examples).to.have.been.called.with.exactly(args[0], args[1]);
		});

		it("accepts behavior defined in function", () => {
			expect(fnBehavior).to.have.been.called.with(args[0]);
		});
	});

	describe("`sharedExamplesFor` scoping", () => {
		var isExamplesProperlyDefined: any;

		describe("suite with `sharedExamplesFor(__test__)`", () => {
			sharedExamplesFor("__test__", () => {
				isExamplesProperlyDefined = true;
				if (typeof it === "function") {
					it("dummy", () => {});
				}
			});
			includeExamplesFor("__test__");
		});

		describe("tests", () => {
			var missedError: any;

			try {
				includeExamplesFor("__test__");
			} catch (error) {
				missedError = error;
			}

			it("defines examples scoped to the suite tree", () => {
				expect(isExamplesProperlyDefined).to.equal(true);
				expect(missedError).to.match(/not defined shared behavior/);
			});
		});
	});
});
