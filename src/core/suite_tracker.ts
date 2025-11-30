import { Metadata } from "./metadata";

export interface SuiteTrackerConfig {
	rootSuite?: any;
	suiteTracker?: any;
}

export class SuiteTracker {
	state: { currentlyDefinedSuite: any; contexts: any[] };

	suiteTracker: any;

	suites: any[];

	constructor(config: SuiteTrackerConfig = {}) {
		this.state = {
			currentlyDefinedSuite: config.rootSuite,
			contexts: [config.rootSuite],
		};
		this.suiteTracker = config.suiteTracker;
		this.suites = [];
		this.cleanUpCurrentContext = this.cleanUpCurrentContext.bind(this);
		this.cleanUpCurrentAndRestorePrevContext =
			this.cleanUpCurrentAndRestorePrevContext.bind(this);
	}

	get currentContext() {
		return this.state.contexts[this.state.contexts.length - 1];
	}

	get currentlyDefinedSuite() {
		return this.state.currentlyDefinedSuite;
	}

	wrapSuite(describe: Function) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const tracker = this;

		return function detectSuite(
			this: any,
			title: string,
			defineTests: Function,
			...suiteArgs: any[]
		) {
			return describe(
				title,
				function defineSuite(this: any, ...args: any[]) {
					tracker.trackSuite(this, defineTests, args);
				},
				...suiteArgs,
			);
		};
	}

	trackSuite(suite: any, defineTests: Function, args: any[]) {
		const previousDefinedSuite = this.state.currentlyDefinedSuite;

		this.defineMetaFor(suite);
		this.state.currentlyDefinedSuite = suite;
		this.execute(defineTests, suite, args);
		this.state.currentlyDefinedSuite = previousDefinedSuite;
	}

	defineMetaFor(suite: any) {
		const meta = Metadata.ensureDefinedOn(suite);
		const parentMeta = Metadata.of(suite.parent || suite.parentSuite);

		if (parentMeta) {
			parentMeta.addChild(meta);
		}
	}

	execute(defineTests: Function, suite: any, args: any[]) {
		this.suiteTracker.before(this, suite);
		defineTests.apply(suite, args);

		if (Metadata.of(suite)) {
			this.suiteTracker.after(this, suite);
		}
	}

	isRoot(suite: any) {
		return !(suite.parent
			? suite.parent.parent
			: suite.parentSuite.parentSuite);
	}

	registerSuite(context: any) {
		this.state.contexts.push(context);
	}

	cleanUp(context: any) {
		const metadata = Metadata.of(context);

		if (metadata) {
			metadata.releaseVars();
		}
	}

	cleanUpCurrentContext() {
		this.cleanUp(this.currentContext);
	}

	cleanUpCurrentAndRestorePrevContext() {
		this.cleanUpCurrentContext();
		this.state.contexts.pop();
	}
}
