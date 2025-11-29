const createLazyVarInterface = require('../../core/interface');
const SuiteTracker = require('../../core/suite_tracker');

function createSuiteTracker() {
  return {
    before(tracker, suite) {
      global.beforeAll(tracker.registerSuite.bind(tracker, suite));
      global.afterAll(tracker.cleanUpCurrentAndRestorePrevContext);
    },

    after(tracker) {
      global.beforeAll(tracker.cleanUpCurrentContext);
    }
  };
}

function addInterface(rootSuite, options) {
  const context = global;

  // Custom suite tracker for Jasmine that gets suite from describe() return value
  class JasmineSuiteTracker extends options.Tracker {
    wrapSuite(describe) {
      const tracker = this;

      return function detectSuite(title, defineTests, ...suiteArgs) {
        const parentSuite = tracker.currentlyDefinedSuite;
        const placeholderSuite = {
          parentSuite,
          parent: parentSuite,
          description: title,
          getFullName() {
            return (parentSuite.getFullName ? `${parentSuite.getFullName()} ` : '') + title;
          }
        };

        return describe(title, (...args) => {
          tracker.trackSuite(placeholderSuite, defineTests, args);
        }, ...suiteArgs);
      };
    }
  }

  const tracker = new JasmineSuiteTracker({ rootSuite, suiteTracker: createSuiteTracker() });
  const { wrapIts, wrapIt, ...ui } = createLazyVarInterface(context, tracker, options);
  const isJest = typeof jest !== 'undefined';

  Object.assign(context, ui);
  ['', 'x', 'f'].forEach((prefix) => {
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

module.exports = {
  createUi(name, options) {
    const config = { Tracker: SuiteTracker, ...options };
    const rootSuite = global.jasmine && typeof global.jasmine.getEnv === 'function'
      ? global.jasmine.getEnv().topSuite()
      : { parent: null, parentSuite: null };

    return addInterface(rootSuite, config);
  }
};
