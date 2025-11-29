/**
 * Setup file for Bun tests
 * Loads the appropriate bdd-lazy-var-next dialect based on SRC_FILE env variable
 */

// Load chai and chai-spies
const chai = require('chai');
const spies = require('chai-spies');

chai.use(spies);

// Set up globals
global.expect = chai.expect;
global.spy = chai.spy;

// Map beforeAll/afterAll to before/after for consistency with Mocha
if (global.beforeAll) {
  global.before = global.beforeAll;
}

if (global.afterAll) {
  global.after = global.afterAll;
}

// Load the appropriate dialect
const srcFile = process.env.SRC_FILE || 'index.js';
require(`../${srcFile}`);

// Load shared test helpers (equivalent to mocha's -r flag)
require('../spec/config');
require('../spec/interface_examples');
require('../spec/default_suite_tracking_examples');
require('../spec/shared_behavior_spec');
