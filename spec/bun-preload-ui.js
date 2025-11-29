
// Preload for interface_spec (uses index.js dialect)
require('./config');
const chai = require('chai');
const { beforeAll, afterAll, beforeEach, afterEach } = require('bun:test');

// Ensure Chai expect is used instead of Bun's expect
beforeAll(() => {
  global.expect = chai.expect;
  global.spy = chai.spy;
});

beforeEach(() => {
  global.expect = chai.expect;
  global.spy = chai.spy;
});

// Ensure aliases
global.before = beforeAll;
global.after = afterAll;
global.beforeEach = beforeEach;
global.afterEach = afterEach;

require('../dist/index.js');

require('./interface_examples');
require('./default_suite_tracking_examples');
// Note: shared_behavior_spec is a test file, not a helper, so it runs on its own
