import createLazyVarInterface from "../../core/interface";
import { SuiteTracker } from "../../core/suite_tracker";

declare const jest: any;

function createSuiteTracker() {
  return {
    before(tracker: SuiteTracker, suite: any) {
      (global as any).beforeAll(() => {
        tracker.registerSuite(suite);
      });
      (global as any).afterAll(() => {
        tracker.cleanUpCurrentAndRestorePrevContext();
      });
    },

    after(_tracker: SuiteTracker) {
      (global as any).beforeAll(() => {
        _tracker.cleanUpCurrentContext();
      });
    },
  };
}

function addInterface(rootSuite: any, options: any) {
  const context = global as any;

  // Custom suite tracker for Jasmine that gets suite from describe() return value
  class JasmineSuiteTracker extends options.Tracker {
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
          ...suiteArgs
        );
      };
    }
  }

  const tracker = new JasmineSuiteTracker({
    rootSuite,
    suiteTracker: createSuiteTracker(),
  });
  const { wrapIts, wrapIt, ...ui } = createLazyVarInterface(
    context,
    tracker,
    options
  );
  const isJest = typeof jest !== "undefined";

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
      (global as any).jasmine &&
      typeof (global as any).jasmine.getEnv === "function"
        ? (global as any).jasmine.getEnv().topSuite()
        : { parent: null, parentSuite: null };

    return addInterface(rootSuite, config);
  },
};
