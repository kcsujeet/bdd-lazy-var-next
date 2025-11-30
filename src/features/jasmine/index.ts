import createLazyVarInterface from "../../core/interface";
import { SuiteTracker } from "../../core/suite_tracker";

declare const jest: any;

function createSuiteTracker(isJest: boolean) {
	return {
		before(tracker: SuiteTracker, suite: any) {
			(globalThis as any).beforeAll(() => {
				tracker.registerSuite(suite);
			});

			if (!isJest) {
				(globalThis as any).afterAll(() => {
					tracker.cleanUpCurrentAndRestorePrevContext();
				});
			}
		},

		after(tracker: SuiteTracker) {
			(globalThis as any).beforeAll(() => {
				tracker.cleanUpCurrentContext();
			});

			if (isJest) {
				(globalThis as any).afterAll(() => {
					tracker.cleanUpCurrentAndRestorePrevContext();
				});
			}
		},
	};
}

function addInterface(rootSuite: any, options: any) {
	const context = globalThis as any;
	const isJest = typeof jest !== "undefined";

	// Custom suite tracker for Jasmine that gets suite from describe() return value
	class JasmineSuiteTracker extends (options.Tracker as typeof SuiteTracker) {
		wrapSuite(describe: Function) {
			return (title: string, defineTests: Function, ...suiteArgs: any[]) => {
				const parentSuite = this.currentlyDefinedSuite;
				const placeholderSuite = {
					parentSuite,
					parent: parentSuite,
					description: title,
					getFullName() {
						return (
							(parentSuite.getFullName ? `${parentSuite.getFullName()} ` : "") +
							title
						);
					},
				};

				return describe(
					title,
					(...args: any[]) => {
						this.trackSuite(placeholderSuite, defineTests, args);
					},
					...suiteArgs,
				);
			};
		}
	}

	const tracker = new JasmineSuiteTracker({
		rootSuite,
		suiteTracker: createSuiteTracker(isJest),
	});
	const { wrapIts, wrapIt, ...ui } = createLazyVarInterface(
		context,
		tracker,
		options,
	);

	Object.assign(context, ui);
	["", "x", "f"].forEach((prefix) => {
		const describeKey = `${prefix}describe`;
		const itKey = `${prefix}it`;

		context[`${itKey}s`] = wrapIts(context[itKey]);
		context[itKey] = wrapIt(context[itKey], isJest);
		context[describeKey] = tracker.wrapSuite(context[describeKey]);
		context[`${prefix}context`] = context[describeKey];
	});
	context.afterEach(tracker.cleanUpCurrentContext);

	return ui;
}

export default {
	createUi(name: string, options: any) {
		const config = { Tracker: SuiteTracker, ...options };
		const rootSuite =
			(globalThis as any).jasmine &&
			typeof (globalThis as any).jasmine.getEnv === "function"
				? (globalThis as any).jasmine.getEnv().topSuite()
				: { parent: null, parentSuite: null };

		return addInterface(rootSuite, config);
	},
};
