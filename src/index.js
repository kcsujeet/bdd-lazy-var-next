let Mocha;

try {
  Mocha = require('mocha'); // eslint-disable-line
} catch (e) {
  // eslint-disable-line
}

let ui;

if (!ui && (typeof vitest !== 'undefined' || (typeof process !== 'undefined' && process.env.VITEST))) { // eslint-disable-line
  ui = require('./features/vitest'); // eslint-disable-line
} else if (!ui && typeof jest !== 'undefined') {
  ui = require('./features/jest'); // eslint-disable-line
} else if (!ui && global.jasmine) {
  ui = require('./features/jasmine');  // eslint-disable-line
} else if (!ui && typeof Bun !== 'undefined' && typeof Bun.jest === 'function') { // eslint-disable-line
  ui = require('./features/bun'); // eslint-disable-line
} else if (!ui && Mocha) {
  ui = require('./features/mocha'); // eslint-disable-line
}

if (!ui) {
  throw new Error(`
    Unable to detect testing framework. Make sure that
      * jest, jasmine, mocha, vitest, or bun test is installed
      * bdd-lazy-var-next is included after "jasmine" or "mocha"
  `);
}

module.exports = ui;
