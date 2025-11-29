(function(factory) {
  if (typeof require === 'function' && typeof module !== 'undefined') {
    require('chai').use(require('chai-spies'));
    factory(require('chai'), global);
  } else if (typeof window === 'object') {
    window.global = window;
    factory(window.chai, window);
  }
})(function(chai, globalContext) {
  globalContext.expect = chai.expect;
  globalContext.spy = chai.spy;

  if (typeof globalContext.beforeAll === 'function') {
    globalContext.before = globalContext.beforeAll;
  } else if (typeof Bun !== 'undefined') {
    try {
      const bunTest = require('bun:test');
      globalContext.before = bunTest.beforeAll;
      globalContext.after = bunTest.afterAll;
      globalContext.beforeAll = bunTest.beforeAll;
      globalContext.afterAll = bunTest.afterAll;
    } catch (e) {}
  }

  if (globalContext.afterAll) {
    globalContext.after = globalContext.afterAll;
  }
});
