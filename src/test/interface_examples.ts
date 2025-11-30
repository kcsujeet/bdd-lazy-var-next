declare var sharedExamplesFor: any;
declare var describe: any;
declare var xdescribe: any;
declare var context: any;
declare var it: any;
declare var def: any;
declare var subject: any;
declare var before: any;
declare var after: any;
declare var beforeEach: any;
declare var afterEach: any;
declare var get: any;

const globalScope =
	typeof globalThis !== "undefined"
		? globalThis
		: typeof global !== "undefined"
			? global
			: typeof window !== "undefined"
				? window
				: ({} as any);

const expect = globalScope.expect;
const spy = globalScope.spy;

const describeFn =
	typeof context === "function"
		? context
		: typeof describe === "function"
			? describe
			: null;

sharedExamplesFor("Lazy Vars Interface", () => {
	describeFn("by default", () => {
		var definition: any;
		var value = {};

		def("var", () => definition());
		def("staticVar", value);

		def("fullName", () => `${get("firstName")} ${get("lastName")}`);

		def("firstName", "John");
		def("lastName", "Doe");

		beforeEach(() => {
			definition = spy();
		});

		it("does not create variable if it has not been accessed", () => {
			expect(definition).not.to.have.been.called();
		});

		it("creates variable only once", () => {
			get("var");
			get("var");

			expect(definition).to.have.been.called.once;
		});

		it("can define static variable", () => {
			expect(get("staticVar")).to.equal(value);
		});

		it("returns `undefined` where there is no definition", () => {
			expect(get("notDefined")).to.equal(undefined);
		});

		it('defines "get.variable" and its alias "get.definitionOf" getter builder', () => {
			expect(get.variable).to.be.a("function");
			expect(get.variable).to.equal(get.definitionOf);
		});

		it("allows to get variable using builder", () => {
			var getStatic = get.variable("staticVar");

			expect(getStatic()).to.equal(get("staticVar"));
		});

		describe("nested suite", () => {
			def("lastName", "Smith");

			it("uses suite specific variable inside dynamic parent variable", () => {
				expect(get("fullName")).to.equal("John Smith");
			});
		});

		context("nested suite using 'context' alias", () => {
			def("lastName", "Cusak");

			it("uses suite specific variable inside dynamic parent variable", () => {
				expect(get("fullName")).to.equal("John Cusak");
			});
		});
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
			valueInBefore = get("var");
		});

		beforeEach(() => {
			if (!skipBeforeEach) {
				skipBeforeEach = true;
				valueInFirstBeforeEach = get("var");
			}
		});

		afterEach(function usesCachedVariable() {
			valueInAfterEach = get("var");

			expect(get("var")).to.equal(prevValue + 1);
		});

		after(function usesNewlyCreatedVariable() {
			expect(get("var")).to.equal(valueInAfterEach + 1);
		});

		it("defines dynamic variable", () => {
			expect(get("var")).to.not.equal(undefined);
		});

		it("stores different values between tests", () => {
			expect(get("var")).to.equal(prevValue + 1);
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
				expect(get("var")).to.equal("Doe");
			});

			it("can define other variables inside", () => {
				expect(get("hasVariables")).to.equal(true);
			});

			describe("nested suite with variable definition", () => {
				def("var", () => `${get("anotherVar")} ${get("var")}`);

				def("anotherVar", () => "John");

				it("uses correct parent variable definition", () => {
					expect(get("var")).to.equal("John Doe");
				});

				describe("one more nested suite without variable definition", () => {
					it("uses correct parent variable definition", () => {
						expect(get("var")).to.equal("John Doe");
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
			expect(get("subject")).to.equal(subjectValue);
		});

		it("is accessible by referencing subject name variable", () => {
			expect(get("named")).to.equal(subjectValue);
		});

		describe("nested suite", () => {
			var nestedSubjectValue = {};

			subject("nested", nestedSubjectValue);

			it('shadows parent "subject" variable', () => {
				expect(get("subject")).to.equal(nestedSubjectValue);
			});

			it("can access parent subject by its name", () => {
				expect(get("named")).to.equal(subjectValue);
			});
		});

		describe("parent subject in child one", () => {
			subject("nested", () => get("subject"));

			it('can access parent subject inside named subject by accessing "subject" variable', () => {
				expect(get("subject")).to.equal(subjectValue);
			});

			it("can access parent subject inside named subject by accessing subject by its name", () => {
				expect(get("nested")).to.equal(subjectValue);
			});
		});
	});

	describe("variables in skipped suite", () => {
		subject([]);

		xdescribe("Skipped suite", () => {
			var object = {};

			subject(object);

			it("defines variables inside skipped suites", () => {
				expect(get("subject")).to.equal(object);
			});
		});
	});

	describe("referencing child lazy variable from parent", () => {
		def("model", () => ({ value: get("value") }));

		describe("nested suite", () => {
			subject(() => get("model").value);

			describe("suite which defines variable used in parent suite", () => {
				def("value", () => ({ x: 5 }));

				subject(() => get("subject").x);

				it("returns 5", () => {
					expect(get("subject")).to.equal(5);
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
		subject(() => ({ isRoot: get("isRoot") }));

		def("isRoot", true);

		describe("one more level which overrides parent variable", () => {
			subject(() => get("subject").isRoot);

			describe("suite that calls parent variable and redefines dependent variable", () => {
				def("isRoot", false);

				it("gets the correct variable", () => {
					expect(get("subject")).to.equal(false);
				});
			});

			describe("suite that calls parent variable", () => {
				it("gets the correct variable", () => {
					expect(get("subject")).to.equal(true);
				});
			});
		});
	});
});

sharedExamplesFor("Root Lazy Vars", () => {
	const varName = `hello.${Date.now()}.${Math.random()}`;

	def(varName, () => "world");

	it("allows to define lazy vars at root level", () => {
		expect(get(varName)).to.equal("world");
	});
});
