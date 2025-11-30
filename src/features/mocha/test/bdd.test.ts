export {};
const describe = (global as any).describe;
const it = (global as any).it;

declare const includeExamplesFor: any;
declare const get: any;
declare const subject: any;
declare const is: any;
declare const xit: any;

describe("Lazy variables interface", () => {
	includeExamplesFor("Lazy Vars Interface", get);
	includeExamplesFor("Default suite tracking", get);

	describe("`it` without message", () => {
		subject(() => ({
			items: [1, 2, 3],
		}));

		it(() => {
			is.expected.to.be.an("object");
		});

		it(() => {
			is.expected.to.have.property("items").which.has.length(3);
		});

		try {
			it.skip(() => {
				is.expected.to.be.never.called();
			});
		} catch {
			xit(() => {
				is.expected.to.be.never.called();
			});
		}
	});
});
