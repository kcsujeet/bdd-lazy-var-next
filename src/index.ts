import { createRequire } from "node:module";
import * as bunFeature from "./features/bun";
import * as jasmineFeature from "./features/jasmine";
import * as jestFeature from "./features/jest";
import * as mochaFeature from "./features/mocha";
import * as vitestFeature from "./features/vitest";
import global from "./utils/global";

const requireModule = createRequire(import.meta.url);

declare const vitest: any;
declare const jest: any;
declare const Bun: any;

let Mocha;

try {
	Mocha = requireModule("mocha"); // eslint-disable-line
} catch {
	// eslint-disable-line
}

let ui;

if (
	!ui &&
	(typeof vitest !== "undefined" ||
		(global as any).vitest ||
		(typeof process !== "undefined" && process.env.VITEST))
) {
	// eslint-disable-line
	ui = vitestFeature; // eslint-disable-line
} else if (!ui && (global as any).jasmine) {
	ui = jasmineFeature; // eslint-disable-line
} else if (!ui && (typeof Bun !== "undefined" || (global as any).Bun)) {
	// eslint-disable-line
	ui = bunFeature; // eslint-disable-line
} else if (
	!ui &&
	(typeof jest !== "undefined" ||
		(global as any).jest ||
		(global as any).expect?.extend ||
		(typeof (global as any).beforeAll === "function" &&
			typeof (global as any).afterAll === "function"))
) {
	ui = jestFeature; // eslint-disable-line
} else if (!ui && (Mocha || (global as any).Mocha)) {
	ui = mochaFeature; // eslint-disable-line
}

if (!ui) {
	throw new Error(`
    Unable to detect testing framework. Make sure that
      * jest, jasmine, mocha, vitest, or bun test is installed
      * bdd-lazy-var-next is included after "jasmine" or "mocha"
  `);
}

// Handle ES module interop
const getInterface = (mod: any) => (mod?.default ? mod.default : mod);
const exportedUi = getInterface(ui);

export default exportedUi;
