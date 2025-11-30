import { expect } from "chai";

const describe = (global as any).describe;
const it = (global as any).it;

declare const spy: any;
declare const includeExamplesFor: any;
declare const subject: any;
declare const def: any;
declare const $subject: any;
declare const $anotherVar: any;
declare const $bddLazyCounter: any;

function getVar(name: string) {
	return (global as any)["$" + name];
}

includeExamplesFor("Root Lazy Vars", getVar);

describe("Interface with globally defined lazy vars", () => {
	includeExamplesFor("Lazy Vars Interface", getVar);
	includeExamplesFor("Default suite tracking", getVar);

	describe("by default", () => {
		subject(() => ({}));

		def("firstName", "John");
		def("anotherVar", "Doe");

		try {
			(global as any).$bddLazyCounter = 2;
			def("bddLazyCounter", 5);
		} catch {
			(global as any).$bddLazyCounter = null;
		}

		it('defines a getter on global object for lazy variable with name prefixed by "$"', () => {
			// eslint-disable-next-line
			expect((global as any).$subject).to.exist;
		});

		it("allows to access lazy variable value by its name", () => {
			expect($subject).to.equal(subject());
		});

		it("forwards calls to `get` function when access variable", () => {
			var accessor = spy();
			var originalGet = (global as any).get;

			(global as any).get = accessor;
			// eslint-disable-next-line
			$anotherVar;
			(global as any).get = originalGet;

			expect(accessor).to.have.been.called.with("anotherVar");
		});

		it("does not allow to redefine existing variable in global context", () => {
			// eslint-disable-next-line
			expect($bddLazyCounter).to.be.null;
		});
	});
});
