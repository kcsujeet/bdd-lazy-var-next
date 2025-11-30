import global from "../../../utils/global";

const describe = (global as any).describe;

declare const includeExamplesFor: any;

describe("Lazy variables interface", () => {
	includeExamplesFor("Lazy Vars Interface");
	includeExamplesFor("Default suite tracking");
});
