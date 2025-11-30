import { expect } from "chai";

declare const sharedExamplesFor: any;
declare const context: any;
declare const xcontext: any;
declare const it: any;
declare const def: any;
declare const subject: any;
declare const before: any;
declare const after: any;
declare const beforeEach: any;
declare const afterEach: any;
declare const spy: any;
declare const get: any;
declare const is: any;
declare const its: any;
declare const xits: any;
declare const xdescribe: any;

const describe = (global as any).context || (global as any).describe;

sharedExamplesFor("Lazy Vars Interface", (getVar: any) => {
	describe("by default", () => {
		var definition: any;
		var value = {};

		def("var", () => definition());
		def("staticVar", value);

		def("fullName", () => `${getVar("firstName")} ${getVar("lastName")}`);

		def("firstName", "John");
		def("lastName", "Doe");

		beforeEach(() => {
			definition = spy();
		});

		it("does not create variable if it has not been accessed", () => {
			expect(definition).not.to.have.been.called();
		});

		it("creates variable only once", () => {
			getVar("var");
			getVar("var");

			expect(definition).to.have.been.called.once;
		});

		it("can define static variable", () => {
			expect(getVar("staticVar")).to.equal(value);
		});

		it("returns `undefined` where there is no definition", () => {
			expect(getVar("notDefined")).to.equal(undefined);
		});

		it('defines "get.variable" and its alias "get.definitionOf" getter builder', () => {
			expect(get.variable).to.be.a("function");
			expect(get.variable).to.equal(get.definitionOf);
		});

		it("allows to get variable using builder", () => {
			var getStatic = get.variable("staticVar");

			expect(getStatic()).to.equal(getVar("staticVar"));
		});

		describe("nested suite", () => {
			def("lastName", "Smith");

			it("uses suite specific variable inside dynamic parent variable", () => {
				expect(getVar("fullName")).to.equal("John Smith");
			});
		});

		context("nested suite using 'context' alias", () => {
			def("lastName", "Cusak");

			it("uses suite specific variable inside dynamic parent variable", () => {
				expect(getVar("fullName")).to.equal("John Cusak");
			});
		});

		try {
			xcontext("skipped context", () => {
				it("should never call assertions", () => {
					is.expected.to.be.never.called();
				});
			});
		} catch {
			it(() => {
				is.expected.to.be.never.called();
			});
		}
	});

	describe("dynamic variable definition", () => {
		var prevValue: any,
			valueInAfterEach: any,
			valueInBefore: any,
			valueInFirstBeforeEach: any,
			skipBeforeEach: any;
		var index = 0;

		def("var", () => {
			prevValue = index;

			return ++index;
		});

		before(() => {
			valueInBefore = getVar("var");
		});

		beforeEach(() => {
			if (!skipBeforeEach) {
				skipBeforeEach = true;
				valueInFirstBeforeEach = getVar("var");
			}
		});

		afterEach(function usesCachedVariable() {
			valueInAfterEach = getVar("var");

			expect(getVar("var")).to.equal(prevValue + 1);
		});

		after(function usesNewlyCreatedVariable() {
			expect(getVar("var")).to.equal(valueInAfterEach + 1);
		});

		it("defines dynamic variable", () => {
			expect(getVar("var")).to.not.equal(undefined);
		});

		it("stores different values between tests", () => {
			expect(getVar("var")).to.equal(prevValue + 1);
		});

		it('does not share the same value between "before" and first "beforeEach" calls', () => {
			expect(valueInBefore).not.to.equal(valueInFirstBeforeEach);
		});
	});

	describe("when fallbacks to parent variable definition through suites tree", () => {
		def("var", "Doe");

		describe("nested suite without variable definition", () => {
			def("hasVariables", true);

			it("fallbacks to parent variable definition", () => {
				expect(getVar("var")).to.equal("Doe");
			});

			it("can define other variables inside", () => {
				expect(getVar("hasVariables")).to.equal(true);
			});

			describe("nested suite with variable definition", () => {
				def("var", () => `${get("anotherVar")} ${getVar("var")}`);

				def("anotherVar", () => "John");

				it("uses correct parent variable definition", () => {
					expect(getVar("var")).to.equal("John Doe");
				});

				describe("one more nested suite without variable definition", () => {
					it("uses correct parent variable definition", () => {
						expect(getVar("var")).to.equal("John Doe");
					});
				});
			});
		});
	});

	describe('when variable is used inside "afterEach" of parent and child suites', () => {
		var subjectInChild: any;

		subject(() => ({}));

		describe("parent suite", () => {
			afterEach(() => {
				expect(subject()).to.equal(subjectInChild);
			});

			describe("child suite", () => {
				it("uses the same variable instance", () => {
					subjectInChild = subject();
				});
			});
		});
	});

	describe("named subject", () => {
		var subjectValue = {};

		subject("named", subjectValue);

		it('is accessible by referencing "subject" variable', () => {
			expect(getVar("subject")).to.equal(subjectValue);
		});

		it("is accessible by referencing subject name variable", () => {
			expect(getVar("named")).to.equal(subjectValue);
		});

		describe("nested suite", () => {
			var nestedSubjectValue = {};

			subject("nested", nestedSubjectValue);

			it('shadows parent "subject" variable', () => {
				expect(getVar("subject")).to.equal(nestedSubjectValue);
			});

			it("can access parent subject by its name", () => {
				expect(getVar("named")).to.equal(subjectValue);
			});
		});

		describe("parent subject in child one", () => {
			subject("nested", () => getVar("subject"));

			it('can access parent subject inside named subject by accessing "subject" variable', () => {
				expect(getVar("subject")).to.equal(subjectValue);
			});

			it("can access parent subject inside named subject by accessing subject by its name", () => {
				expect(getVar("nested")).to.equal(subjectValue);
			});
		});
	});

	describe("variables in skipped suite", () => {
		subject([]);

		xdescribe("Skipped suite", () => {
			var object = {};

			subject(object);

			it("defines variables inside skipped suites", () => {
				expect(getVar("subject")).to.equal(object);
			});
		});
	});

	describe("referencing child lazy variable from parent", () => {
		def("model", () => ({ value: getVar("value") }));

		describe("nested suite", () => {
			subject(() => getVar("model").value);

			describe("suite which defines variable used in parent suite", () => {
				def("value", () => ({ x: 5 }));

				subject(() => getVar("subject").x);

				it("returns 5", () => {
					expect(getVar("subject")).to.equal(5);
				});
			});
		});
	});

	describe("when parent variable is accessed multiple times inside child definition", () => {
		subject(() => ({ isParent: true, name: "test" }));

		describe("child suite", () => {
			subject(() => ({
				isParent: !subject().isParent,
				name: `${subject().name} child`,
			}));

			it("retrieves proper parent variable", () => {
				expect(subject().isParent).to.equal(false);
				expect(subject().name).to.equal("test child");
			});
		});
	});

	describe("when calls variable defined in parent suites", () => {
		subject(() => ({ isRoot: getVar("isRoot") }));

		def("isRoot", true);

		describe("one more level which overrides parent variable", () => {
			subject(() => getVar("subject").isRoot);

			describe("suite that calls parent variable and redefines dependent variable", () => {
				def("isRoot", false);

				it("gets the correct variable", () => {
					expect(getVar("subject")).to.equal(false);
				});
			});

			describe("suite that calls parent variable", () => {
				it("gets the correct variable", () => {
					expect(getVar("subject")).to.equal(true);
				});
			});
		});
	});

	describe("`its`", () => {
		subject(() => ({
			value: 5,
			nested: {
				value: 10,
			},
			getName() {
				return "John";
			},
		}));

		its("value", () => {
			is.expected.to.equal(getVar("subject").value);
		});

		its("getName", () => {
			is.expected.to.equal(getVar("subject").getName());
		});

		its("nested.value", () => {
			is.expected.to.equal(getVar("subject").nested.value);
		});

		try {
			its.skip("name", () => {
				is.expected.to.be.never.called();
			});
		} catch {
			xits("name", () => {
				is.expected.to.be.never.called();
			});
		}
	});
});

sharedExamplesFor("Root Lazy Vars", (getVar: any) => {
	const varName = `hello.${Date.now()}.${Math.random()}`;

	def(varName, () => "world");

	it("allows to define lazy vars at root level", () => {
		expect(getVar(varName)).to.equal("world");
	});
});
