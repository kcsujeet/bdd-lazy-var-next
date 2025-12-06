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
	const { wrapIt, ...helpers } = createLazyVarInterface(
		context,
		tracker,
		options,
	);

	Object.assign(context, helpers);
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
			context[describeKey] = tracker.wrapSuite(describeFn);
			context[`${prefix}context`] = context[describeKey];
		}
	});

	// Use global afterEach directly (Bun test doesn't have it on context)
	if (typeof (global as any).afterEach === "function") {
		(global as any).afterEach(tracker.cleanUpCurrentContext);
	}

	// NOTE: Mocking bun:test causes hangs in some environments/versions of Bun.
	// It seems to create a deadlock or infinite recursion when loading bun:test.
	try {
		const { mock } = requireModule("bun:test");
		if (mock?.module) {
			mock.module("bun:test", () => {
				const original = requireModule("bun:test");
				return {
					...original,
					describe: context.describe,
					xdescribe: context.xdescribe,
					fdescribe: context.fdescribe,
					it: context.it,
					xit: context.xit,
					fit: context.fit,
					test: context.it,
					xtest: context.xit,
					ftest: context.fit,
				};
			});
		}
	} catch (_e) {
		// Ignore if mocking fails or not available
	}

	return helpers;
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
	createHelpers(name: string, options: any) {
		const config = { Tracker: SuiteTracker, ...options };
		return addInterface(createRootSuite(), config);
	},
};

export default api;

// Auto-initialize
const helpers = api.createHelpers("bdd-lazy-var-next", {});

export const {
	get,
	def,
	subject,
	sharedExamplesFor,
	includeExamplesFor,
	itBehavesLike,
} = helpers;
