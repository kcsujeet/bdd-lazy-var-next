export {};
const describe = (global as any).describe;

declare const includeExamplesFor: any;
declare const get: any;

describe("Lazy variables interface", () => {
	includeExamplesFor("Lazy Vars Interface", get);
	includeExamplesFor("Default suite tracking", get);
});
