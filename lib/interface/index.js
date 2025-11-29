let Mocha;

try {
  Mocha = require('mocha'); // eslint-disable-line
} catch (e) {
  // eslint-disable-line
}

let ui;

if (typeof Bun !== 'undefined' && typeof Bun.jest === 'function') { // eslint-disable-line
  ui = require('./bun'); // eslint-disable-line
} else if (typeof jest !== 'undefined') {
  ui = require('./jest'); // eslint-disable-line
} else if (global.jasmine) {
  ui = require('./jasmine');  // eslint-disable-line
} else if (typeof vitest !== 'undefined' || (typeof process !== 'undefined' && process.env.VITEST)) { // eslint-disable-line
  ui = require('./vitest'); // eslint-disable-line
} else if (Mocha) {
  ui = require('./mocha'); // eslint-disable-line
}

if (!ui) {
  throw new Error(`
    Unable to detect testing framework. Make sure that
      * jest, jasmine, mocha, vitest, or bun test is installed
      * bdd-lazy-var-next is included after "jasmine" or "mocha"
  `);
}

module.exports = ui;
