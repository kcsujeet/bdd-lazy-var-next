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
	let ui: any;

	rootSuite.afterEach(tracker.cleanUpCurrentContext);
	rootSuite.on("pre-require", (context: any) => {
		const { describe, it } = context;

		if (!ui) {
			ui = createLazyVarInterface(context, tracker, options);
			const { wrapIts: _wrapIts, wrapIt: _wrapIt, ...restUi } = ui;
			Object.assign(context, restUi);
		}

		context.its = ui.wrapIts(it);
		context.its.only = ui.wrapIts(it.only);
		context.its.skip = ui.wrapIts(it.skip);
		context.it = ui.wrapIt(it);
		context.it.only = ui.wrapIt(it.only);
		context.it.skip = ui.wrapIt(it.skip);
		context.describe = tracker.wrapSuite(describe);
		context.describe.skip = tracker.wrapSuite(describe.skip);
		context.describe.only = tracker.wrapSuite(describe.only);
		context.context = context.describe;
		context.xdescribe = context.xcontext = context.describe.skip;
	});
}

export default {
	createUi(name: string, options: any) {
		const config = {
			Tracker: SuiteTracker,
			inheritUi: "bdd",
			...options,
		};

		(Mocha.interfaces as any)[name] = (rootSuite: any) => {
			(Mocha.interfaces as any)[config.inheritUi](rootSuite);
			return addInterface(rootSuite, config);
		};

		const getters = [
			"get",
			"def",
			"subject",
			"its",
			"it",
			"is",
			"sharedExamplesFor",
			"includeExamplesFor",
			"itBehavesLike",
		];
		const defs = getters.reduce((all: any, uiName: string) => {
			all[uiName] = { get: () => (global as any)[uiName] };
			return all;
		}, {});

		return Object.defineProperties((Mocha.interfaces as any)[name], defs);
	},
};
