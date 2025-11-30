const chai = require("chai");
const spies = require("chai-spies");

declare const Bun: any;

chai.use(spies);

(global as any).expect = chai.expect;
(global as any).spy = chai.spy;

if (typeof (global as any).beforeAll === "function") {
	(global as any).before = (global as any).beforeAll;
} else if (typeof Bun !== "undefined") {
	try {
		const bunTest = require("bun:test");
		(global as any).before = bunTest.beforeAll;
		(global as any).after = bunTest.afterAll;
		(global as any).beforeAll = bunTest.beforeAll;
		(global as any).afterAll = bunTest.afterAll;
	} catch {
		// ignore
	}
}

if ((global as any).afterAll) {
	(global as any).after = (global as any).afterAll;
}
