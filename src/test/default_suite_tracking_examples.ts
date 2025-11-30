import { expect } from "chai";
import global from "../utils/global";

declare const it: any;
declare const def: any;
declare const before: any;
declare const after: any;
declare const beforeEach: any;
declare const afterEach: any;

(global as any).sharedExamplesFor("Default suite tracking", (getVar: any) => {
	(
		global as any
	).describe("when using variable inside another variable definition", () => {
		var user = { firstName: "John", lastName: "Doe" };
		var index = 0;
		var currentIndex: any;

		before(() => {
			expect(getVar("currentIndex")).to.equal(currentIndex);
		});

		beforeEach(
			function usesVariableDefinedInCurrentlyRunningSuiteInBeforeEachCallback() {
				expect(cast(getVar("currentIndex"))).to.equal(cast(currentIndex));
			},
		);

		afterEach(
			function usesVariableDefinedInCurrentlyRunningSuiteInAfterEachCallback() {
				expect(cast(getVar("currentIndex"))).to.equal(cast(currentIndex));
			},
		);

		after(function usesOwnDefinedVariable() {
			expect(getVar("currentIndex")).to.equal(currentIndex);
		});

		def("personName", () => `${getVar("firstName")} ${getVar("lastName")}`);

		def("firstName", user.firstName);
		def("lastName", user.lastName);

		def("currentIndex", () => {
			currentIndex = ++index;

			return currentIndex;
		});

		def("CurrenIndexType", () => Number);

		it("computes the proper result", () => {
			expect(getVar("personName")).to.equal(
				`${user.firstName} ${user.lastName}`,
			);
		});

		(global as any).describe("nested suite", () => {
			var nestedUser = { firstName: "Alex" };

			before(() => {
				expect(getVar("currentIndex")).to.equal(cast(currentIndex));
			});

			beforeEach(
				function usesOwnDefinedVariableInBeforeEachCallbackEvenWhenItIsRunForNestedTests() {
					// eslint-disable-line max-len
					expect(getVar("currentIndex")).to.equal(cast(currentIndex));
				},
			);

			afterEach(
				function usesOwnDefinedVariableInAfterEachCallbackEvenWhenItIsRunForNestedTests() {
					// eslint-disable-line max-len
					expect(getVar("currentIndex")).to.equal(cast(currentIndex));
				},
			);

			after(function usesOwnDefinedVariable() {
				expect(getVar("currentIndex")).to.equal(cast(currentIndex));
			});

			def("firstName", nestedUser.firstName);

			def("currentIndex", () => cast(getVar("currentIndex")));

			def("CurrenIndexType", () => String);

			it("falls back to parent variable", () => {
				expect(getVar("lastName")).to.equal("Doe");
			});

			it("computes parent variable using redefined variable", () => {
				expect(getVar("personName")).to.equal(
					`${nestedUser.firstName} ${getVar("lastName")}`,
				);
			});

			it("can redefine parent variable with the same name and access value of parent variable inside definition", () => {
				expect(getVar("currentIndex")).to.equal(cast(currentIndex));
			});
		});

		function cast(value: any) {
			var convert = getVar("CurrenIndexType");

			return convert(value);
		}
	});
});
