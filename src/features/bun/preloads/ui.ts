import '../../../test/config';
import chai from 'chai';
import {
  beforeAll, afterAll, beforeEach, afterEach
} from 'bun:test';

declare global {
  var expect: any;
  var spy: any;
  var before: any;
  var after: any;
}

// Ensure Chai expect is used instead of Bun's expect
beforeAll(() => {
  (global as any).expect = chai.expect;
  (global as any).spy = chai.spy;
});

beforeEach(() => {
  (global as any).expect = chai.expect;
  (global as any).spy = chai.spy;
});

// Ensure aliases
(global as any).before = beforeAll;
(global as any).after = afterAll;
(global as any).beforeEach = beforeEach;
(global as any).afterEach = afterEach;

require('../../../dialects/bdd');

require('../../../test/interface_examples');
require('../../../test/default_suite_tracking_examples');
// Note: shared_behavior.spec is a test file, not a helper, so it runs on its own
