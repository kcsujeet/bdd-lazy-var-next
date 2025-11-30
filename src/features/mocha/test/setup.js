import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
try {
	global.Mocha = require("mocha");
} catch (e) {
	console.error("Failed to require mocha in setup:", e);
}
