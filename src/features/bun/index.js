const createLazyVarInterface = require('../../core/interface');
const SuiteTracker = require('../../core/suite_tracker');

function createSuiteTracker() {
  let beforeAll;
  let afterAll;
  let beforeEach;
  try {
    const bunTest = require('bun:test'); // eslint-disable-line global-require, import/no-unresolved
    beforeAll = bunTest.beforeAll;
    afterAll = bunTest.afterAll;
    beforeEach = bunTest.beforeEach;
  } catch (e) {
    beforeAll = global.beforeAll;
    afterAll = global.afterAll;
    beforeEach = global.beforeEach;
  }

  return {
    before(tracker, suite) {
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

    after(tracker) {
      afterAll(tracker.cleanUpCurrentAndRestorePrevContext);
    }
  };
}

function addInterface(rootSuite, options) {
  const context = global;
  let originalDescribe = context.describe;
  let originalIt = context.it;

  if (!originalDescribe) {
    try {
      const bunTest = require('bun:test'); // eslint-disable-line global-require, import/no-unresolved
      originalDescribe = bunTest.describe;
      originalIt = bunTest.it;
      // Make sure they are available globally if not already
      if (!context.describe) context.describe = originalDescribe;
      if (!context.it) context.it = originalIt;
    } catch (e) {
      // Ignore
    }
  }

  class BunSuiteTracker extends options.Tracker {
    trackSuite(suite, defineTests, args) {
      super.trackSuite(suite, defineTests, args);
    }

    wrapSuite(describe) {
      const tracker = this;

      return function (title, defineTests, ...suiteArgs) {
        const parentSuite = tracker.currentlyDefinedSuite;
        return describe(title, (...args) => {
          const placeholderSuite = {
            id: Symbol(title),
            root: false,
            parent: parentSuite,
            parentSuite,
            title,
          };

          tracker.trackSuite(placeholderSuite, defineTests, args);
        }, ...suiteArgs);
      };
    }
  }

  const tracker = new BunSuiteTracker({ rootSuite, suiteTracker: createSuiteTracker() });
  const { wrapIts, wrapIt, ...ui } = createLazyVarInterface(context, tracker, options);

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
      const wrapped = tracker.wrapSuite(describeFn);
      context[describeKey] = wrapped;
      try {
        Object.defineProperty(context, describeKey, {
          value: wrapped,
          writable: true,
          configurable: true
        });

        // Try to patch bun:test module exports
        const bunTest = require('bun:test'); // eslint-disable-line global-require, import/no-unresolved
        if (bunTest.describe !== wrapped) {
          bunTest.describe = wrapped;
        }
      } catch (e) {
        // Ignore
      }
      context[`${prefix}context`] = wrapped;
    }
  });

  // Use global afterEach directly (Bun test doesn't have it on context)
  if (typeof global.afterEach === 'function') {
    global.afterEach(tracker.cleanUpCurrentContext);
  }

  return ui;
}

// Bun test doesn't have a top-level suite object
// We need to create a synthetic root suite
function createRootSuite() {
  return {
    parent: null,
    parentSuite: null
  };
}

module.exports = {
  createUi(name, options) {
    const config = { Tracker: SuiteTracker, ...options };
    return addInterface(createRootSuite(), config);
  }
};
