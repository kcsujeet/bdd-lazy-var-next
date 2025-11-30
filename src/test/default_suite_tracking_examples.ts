import global from "../utils/global";

declare const it: any;
declare const def: any;
declare const before: any;
declare const after: any;
declare const beforeEach: any;
declare const afterEach: any;
declare const get: any;

const expect = (global as any).expect;

(global as any).sharedExamplesFor("Default suite tracking", () => {
	(
		global as any
	).describe("when using variable inside another variable definition", () => {
		var user = { firstName: "John", lastName: "Doe" };
		var index = 0;
		var currentIndex: any;

		before(() => {
			expect(get("currentIndex")).to.equal(currentIndex);
		});

		beforeEach(
			function usesVariableDefinedInCurrentlyRunningSuiteInBeforeEachCallback() {
				expect(cast(get("currentIndex"))).to.equal(cast(currentIndex));
			},
		);

		afterEach(
			function usesVariableDefinedInCurrentlyRunningSuiteInAfterEachCallback() {
				expect(cast(get("currentIndex"))).to.equal(cast(currentIndex));
			},
		);

		after(function usesOwnDefinedVariable() {
			expect(get("currentIndex")).to.equal(currentIndex);
		});

		def("personName", () => `${get("firstName")} ${get("lastName")}`);

		def("firstName", user.firstName);
		def("lastName", user.lastName);

		def("currentIndex", () => {
			currentIndex = ++index;

			return currentIndex;
		});

		def("CurrenIndexType", () => Number);

		it("computes the proper result", () => {
			expect(get("personName")).to.equal(`${user.firstName} ${user.lastName}`);
		});

		(global as any).describe("nested suite", () => {
			var nestedUser = { firstName: "Alex" };

			before(() => {
				expect(get("currentIndex")).to.equal(cast(currentIndex));
			});

			beforeEach(
				function usesOwnDefinedVariableInBeforeEachCallbackEvenWhenItIsRunForNestedTests() {
					// eslint-disable-line max-len
					expect(get("currentIndex")).to.equal(cast(currentIndex));
				},
			);

			afterEach(
				function usesOwnDefinedVariableInAfterEachCallbackEvenWhenItIsRunForNestedTests() {
					// eslint-disable-line max-len
					expect(get("currentIndex")).to.equal(cast(currentIndex));
				},
			);

			after(function usesOwnDefinedVariable() {
				expect(get("currentIndex")).to.equal(cast(currentIndex));
			});

			def("firstName", nestedUser.firstName);

			def("currentIndex", () => cast(get("currentIndex")));

			def("CurrenIndexType", () => String);

			it("falls back to parent variable", () => {
				expect(get("lastName")).to.equal("Doe");
			});

			it("computes parent variable using redefined variable", () => {
				expect(get("personName")).to.equal(
					`${nestedUser.firstName} ${get("lastName")}`,
				);
			});

			it("can redefine parent variable with the same name and access value of parent variable inside definition", () => {
				expect(get("currentIndex")).to.equal(cast(currentIndex));
			});
		});

		function cast(value: any) {
			var convert = get("CurrenIndexType");

			return convert(value);
		}
	});
});
