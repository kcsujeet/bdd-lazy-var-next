import global from "./utils/global";

declare const vitest: any;
declare const jest: any;
declare const Bun: any;

let Mocha;

try {
	Mocha = require("mocha"); // eslint-disable-line
} catch {
	// eslint-disable-line
}

let ui;

if (
	!ui &&
	(typeof vitest !== "undefined" ||
		(typeof process !== "undefined" && process.env.VITEST))
) {
	// eslint-disable-line
	ui = require("./features/vitest"); // eslint-disable-line
} else if (!ui && (global as any).jasmine) {
	ui = require("./features/jasmine"); // eslint-disable-line
} else if (!ui && typeof Bun !== "undefined") {
	// eslint-disable-line
	ui = require("./features/bun"); // eslint-disable-line
} else if (!ui && typeof jest !== "undefined") {
	ui = require("./features/jest"); // eslint-disable-line
} else if (!ui && (Mocha || (global as any).Mocha)) {
	ui = require("./features/mocha"); // eslint-disable-line
}

if (!ui) {
	throw new Error(`
    Unable to detect testing framework. Make sure that
      * jest, jasmine, mocha, vitest, or bun test is installed
      * bdd-lazy-var-next is included after "jasmine" or "mocha"
  `);
}

// Handle ES module interop
const getInterface = (mod: any) => (mod && mod.default ? mod.default : mod);
const exportedUi = getInterface(ui);

export default exportedUi;
