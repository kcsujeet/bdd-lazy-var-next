import { createRequire } from "node:module";
import createLazyVarInterface from "../../core/interface";
import { SuiteTracker } from "../../core/suite_tracker";

const requireModule = createRequire(import.meta.url);

function createSuiteTracker() {
	let beforeAll: any;
	let afterAll: any;
	let beforeEach: any;
	try {
		const bunTest = requireModule("bun:test"); // eslint-disable-line global-require, import/no-unresolved
		beforeAll = bunTest.beforeAll;
		afterAll = bunTest.afterAll;
		beforeEach = bunTest.beforeEach;
	} catch {
		beforeAll = (global as any).beforeAll;
		afterAll = (global as any).afterAll;
		beforeEach = (global as any).beforeEach;
	}

	return {
		before(tracker: SuiteTracker, suite: any) {
			beforeAll(tracker.registerSuite.bind(tracker, suite));
			if (beforeEach) {
				beforeEach(() => {
					let current = suite;
					while (current) {
						tracker.cleanUp(current);
						current = current.parent || current.parentSuite;
					}
				});
			}
		},

		after(tracker: SuiteTracker) {
			afterAll(tracker.cleanUpCurrentAndRestorePrevContext);
		},
	};
}

function addInterface(rootSuite: any, options: any) {
	const context = global as any;
	let originalDescribe = context.describe;
	let originalIt = context.it;

	if (!originalDescribe) {
		try {
			const bunTest = requireModule("bun:test"); // eslint-disable-line global-require, import/no-unresolved
			originalDescribe = bunTest.describe;
			originalIt = bunTest.it;
			// Make sure they are available globally if not already
			if (!context.describe) context.describe = originalDescribe;
			if (!context.it) context.it = originalIt;
		} catch {
			// Ignore
		}
	}

	class BunSuiteTracker extends (options.Tracker as typeof SuiteTracker) {
		trackSuite(suite: any, defineTests: Function, args: any[]) {
			super.trackSuite(suite, defineTests, args);
		}

		wrapSuite(describe: Function) {
			return (title: string, defineTests: Function, ...suiteArgs: any[]) => {
				const parentSuite = this.currentlyDefinedSuite;
				// Ensure describe is a function before calling it
				if (typeof describe !== "function") {
					throw new Error(
						`describe is not a function. It is ${typeof describe}`,
					);
				}
				return describe(
					title,
					(...args: any[]) => {
						const placeholderSuite = {
							id: Symbol(title),
							root: false,
							parent: parentSuite,
							parentSuite,
							title,
						};

						this.trackSuite(placeholderSuite, defineTests, args);
					},
					...suiteArgs,
				);
			};
		}
	}

	const tracker = new BunSuiteTracker({
		rootSuite,
		suiteTracker: createSuiteTracker(),
	});
	const { wrapIt, ...ui } = createLazyVarInterface(context, tracker, options);

	Object.assign(context, ui);
	["", "x", "f"].forEach((prefix) => {
		const describeKey = `${prefix}describe`;
		const itKey = `${prefix}it`;

		let describeFn = context[describeKey];
		if (!describeFn && originalDescribe) {
			if (prefix === "") describeFn = originalDescribe;
			if (prefix === "x") describeFn = originalDescribe.skip;
			if (prefix === "f") {
				try {
					describeFn = originalDescribe.only;
				} catch {
					// Ignore error in CI environments where .only is disabled
				}
			}
		}

		let itFn = context[itKey];
		if (!itFn && originalIt) {
			if (prefix === "x") itFn = originalIt.skip;
			if (prefix === "f") {
				try {
					itFn = originalIt.only;
				} catch {
					// Ignore error in CI environments where .only is disabled
				}
			}
		}

		if (itFn) {
			context[itKey] = wrapIt(itFn, false);
		}

		if (describeFn) {
			const wrapped = tracker.wrapSuite(describeFn);

			try {
				const currentVal = wrapped;
				Object.defineProperty(context, describeKey, {
					get() {
						return currentVal;
					},
					set(_val) {
						// Ignore assignment to preserve our wrapper
					},
					configurable: true,
					enumerable: true,
				});

				// Try to patch bun:test module exports
				const bunTest = requireModule("bun:test"); // eslint-disable-line global-require, import/no-unresolved
				if (bunTest) {
					if (bunTest.describe !== wrapped) {
						bunTest.describe = wrapped;
					}
					if (prefix === "x" && bunTest.describe.skip !== wrapped) {
						bunTest.describe.skip = wrapped;
					}
					if (prefix === "f") {
						try {
							if (bunTest.describe.only !== wrapped) {
								bunTest.describe.only = wrapped;
							}
						} catch {
							// Ignore error in CI environments where .only is disabled
						}
					}

					// Attempt to mock the module for ESM imports
					if (bunTest.mock?.module) {
						bunTest.mock.module("bun:test", () => {
							return {
								...bunTest,
								describe: context.describe,
								it: context.it,
								xdescribe: context.xdescribe,
								fdescribe: context.fdescribe,
								xit: context.xit,
								fit: context.fit,
							};
						});
					}
				}
			} catch {
				// Ignore
			}
			context[`${prefix}context`] = wrapped;
		}
	});

	// Use global afterEach directly (Bun test doesn't have it on context)
	if (typeof (global as any).afterEach === "function") {
		(global as any).afterEach(tracker.cleanUpCurrentContext);
	}

	return ui;
}

// Bun test doesn't have a top-level suite object
// We need to create a synthetic root suite
function createRootSuite() {
	return {
		parent: null,
		parentSuite: null,
	};
}

const api = {
	createUi(name: string, options: any) {
		const config = { Tracker: SuiteTracker, ...options };
		return addInterface(createRootSuite(), config);
	},
};

export default api;

// Auto-initialize
const ui = api.createUi("bdd-lazy-var-next", {});

export const {
	get,
	def,
	subject,
	sharedExamplesFor,
	includeExamplesFor,
	itBehavesLike,
} = ui;
