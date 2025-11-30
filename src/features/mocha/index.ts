import { createRequire } from "node:module";
import createLazyVarInterface from "../../core/interface";
import { SuiteTracker } from "../../core/suite_tracker";
import global from "../../utils/global";

const requireModule = createRequire(import.meta.url);

let Mocha: any;
try {
	Mocha = requireModule("mocha"); // eslint-disable-line
} catch {
	// ignore
}

if (!Mocha && (global as any).Mocha) {
	Mocha = (global as any).Mocha;
}

function createSuiteTracker() {
	return {
		before(tracker: SuiteTracker, suite: any) {
			suite.beforeAll(tracker.registerSuite.bind(tracker, suite));
		},

		after(tracker: SuiteTracker, suite: any) {
			suite.beforeAll(tracker.cleanUpCurrentContext);
			suite.afterAll(tracker.cleanUpCurrentAndRestorePrevContext);
		},
	};
}

function addInterface(rootSuite: any, options: any) {
	const tracker = new options.Tracker({
		rootSuite,
		suiteTracker: createSuiteTracker(),
	});
	let helpers: any;

	rootSuite.afterEach(tracker.cleanUpCurrentContext);
	rootSuite.on("pre-require", (context: any) => {
		const { describe, it } = context;

		if (!helpers) {
			helpers = createLazyVarInterface(context, tracker, options);
			const { wrapIt: _wrapIt, ...restHelpers } = helpers;
			Object.assign(context, restHelpers);
		}

		context.it = helpers.wrapIt(it);
		context.it.only = helpers.wrapIt(it.only);
		context.it.skip = helpers.wrapIt(it.skip);
		context.describe = tracker.wrapSuite(describe);
		context.describe.skip = tracker.wrapSuite(describe.skip);
		context.describe.only = tracker.wrapSuite(describe.only);
		context.context = context.describe;
		context.xdescribe = context.xcontext = context.describe.skip;
	});
}

const api = {
	createHelpers(name: string, options: any) {
		const config = {
			Tracker: SuiteTracker,
			inheritInterface: "bdd",
			...options,
		};

		(Mocha.interfaces as any)[name] = (rootSuite: any) => {
			(Mocha.interfaces as any)[config.inheritInterface](rootSuite);
			return addInterface(rootSuite, config);
		};

		const getters = [
			"get",
			"def",
			"subject",
			"it",
			"sharedExamplesFor",
			"includeExamplesFor",
			"itBehavesLike",
		];
		const defs = getters.reduce((all: any, helperName: string) => {
			all[helperName] = { get: () => (global as any)[helperName] };
			return all;
		}, {});

		return Object.defineProperties((Mocha.interfaces as any)[name], defs);
	},
};

export default api;

// Auto-initialize
if (Mocha) {
	api.createHelpers("bdd-lazy-var-next", {});
}

const proxyFn = (name: string): any => {
	return new Proxy(() => {}, {
		apply: (_target, _thisArg, args) => (global as any)[name](...args),
		get: (_target, prop) => (global as any)[name][prop],
	});
};

export const get = proxyFn("get");
export const def = proxyFn("def");
export const subject = proxyFn("subject");
export const sharedExamplesFor = proxyFn("sharedExamplesFor");
export const includeExamplesFor = proxyFn("includeExamplesFor");
export const itBehavesLike = proxyFn("itBehavesLike");
