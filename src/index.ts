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

let adapter;

if (
	!adapter &&
	(typeof vitest !== "undefined" ||
		(global as any).vitest ||
		(typeof process !== "undefined" && process.env.VITEST))
) {
	// eslint-disable-line
	adapter = vitestFeature; // eslint-disable-line
} else if (!adapter && (global as any).jasmine) {
	adapter = jasmineFeature; // eslint-disable-line
} else if (!adapter && (typeof Bun !== "undefined" || (global as any).Bun)) {
	// eslint-disable-line
	adapter = bunFeature; // eslint-disable-line
} else if (
	!adapter &&
	(typeof jest !== "undefined" ||
		(global as any).jest ||
		(global as any).expect?.extend ||
		(typeof (global as any).beforeAll === "function" &&
			typeof (global as any).afterAll === "function"))
) {
	adapter = jestFeature; // eslint-disable-line
} else if (!adapter && (Mocha || (global as any).Mocha)) {
	adapter = mochaFeature; // eslint-disable-line
}

if (!adapter) {
	throw new Error(`
    Unable to detect testing framework. Make sure that
      * jest, jasmine, mocha, vitest, or bun test is installed
      * bdd-lazy-var-next is included after "jasmine" or "mocha"
  `);
}

// Handle ES module interop
const getInterface = (mod: any) => (mod?.default ? mod.default : mod);
const exportedHelpers = getInterface(adapter);

export default exportedHelpers;
