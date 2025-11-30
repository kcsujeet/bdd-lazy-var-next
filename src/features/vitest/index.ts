import createLazyVarInterface from '../../core/interface';
import { SuiteTracker } from '../../core/suite_tracker';

function createSuiteTracker() {
  return {
    before(tracker: SuiteTracker, suite: any) {
      (global as any).beforeAll(tracker.registerSuite.bind(tracker, suite));
      (global as any).afterAll(tracker.cleanUpCurrentAndRestorePrevContext);
    },

    after(tracker: SuiteTracker) {
      (global as any).beforeAll(tracker.cleanUpCurrentContext);
    },
  };
}

function addInterface(rootSuite: any, options: any) {
  const context = global as any;
  const originalDescribe = context.describe;
  const originalIt = context.it;

  class VitestSuiteTracker extends (options.Tracker as typeof SuiteTracker) {
    wrapSuite(describe: Function) {
      return (title: string, defineTests: Function, ...suiteArgs: any[]) => {
        const parentSuite = this.currentlyDefinedSuite;
        const fakeSuite = {
          id: `fake_${Math.random()}`,
          description: title,
          parent: parentSuite,
          parentSuite,
        };

        return describe(
          title,
          (...args: any[]) => {
            this.trackSuite(fakeSuite, defineTests, args);
          },
          ...suiteArgs
        );
      };
    }
  }

  const tracker = new VitestSuiteTracker({
    rootSuite,
    suiteTracker: createSuiteTracker(),
  });
  const { wrapIts, wrapIt, ...ui } = createLazyVarInterface(
    context,
    tracker,
    options
  );

  Object.assign(context, ui);
  ['', 'x', 'f'].forEach((prefix) => {
    const describeKey = `${prefix}describe`;
    const itKey = `${prefix}it`;

    let describeFn = context[describeKey];
    if (!describeFn && originalDescribe) {
      if (prefix === 'x') describeFn = originalDescribe.skip;
      if (prefix === 'f') describeFn = originalDescribe.only;
    }

    let itFn = context[itKey];
    if (!itFn && originalIt) {
      if (prefix === 'x') itFn = originalIt.skip;
      if (prefix === 'f') itFn = originalIt.only;
    }

    if (itFn) {
      context[`${itKey}s`] = wrapIts(itFn);
      context[itKey] = wrapIt(itFn, false);
    }

    if (describeFn) {
      context[describeKey] = tracker.wrapSuite(describeFn);
      context[`${prefix}context`] = context[describeKey];
    }
  });
  context.afterEach(tracker.cleanUpCurrentContext);

  return ui;
}

// Vitest doesn't have a top-level suite object like Jasmine
// We need to create a synthetic root suite
function createRootSuite() {
  return {
    parent: null,
    parentSuite: null,
  };
}

export default {
  createUi(name: string, options: any) {
    const config = { Tracker: SuiteTracker, ...options };
    return addInterface(createRootSuite(), config);
  },
};
