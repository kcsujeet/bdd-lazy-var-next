// NOTE: We cannot import describe/it/expect from @jest/globals because bdd-lazy-var-next
// needs to wrap the global versions to track suite context.
// import { describe, it, expect } from "@jest/globals";

const calculateLineItemTotalTaxRate = (lineItem: {
	line_item_taxes?: { rate: string | number }[];
}) => {
	const taxes = lineItem.line_item_taxes;
	if (!taxes || taxes.length === 0) {
		return 0;
	}

	const totalRate = taxes.reduce((sum, tax) => {
		const rate = typeof tax.rate === "string" ? parseFloat(tax.rate) : tax.rate;
		return sum + rate;
	}, 0);

	return totalRate / 100;
};

describe("calculateTotalTaxRate", () => {
	def("lineItem", () => ({}));

	describe("with no taxes", () => {
		def("lineItem", () => ({
			line_item_taxes: [],
		}));

		it("should return 0", () => {
			expect(calculateLineItemTotalTaxRate(get("lineItem"))).toBe(0);
		});
	});

	describe("with undefined taxes", () => {
		it("should return 0", () => {
			expect(calculateLineItemTotalTaxRate(get("lineItem"))).toBe(0);
		});
	});

	describe("with multiple tax rates", () => {
		def("lineItem", () => ({
			line_item_taxes: [{ rate: "10.00" }, { rate: "5.00" }],
		}));

		it("should sum and convert to decimal", () => {
			expect(calculateLineItemTotalTaxRate(get("lineItem"))).toBe(0.15);
		});
	});

	describe("with mixed string and number rates", () => {
		def("lineItem", () => ({
			line_item_taxes: [{ rate: "7.50" }, { rate: 2.5 }],
		}));

		it("should handle both types", () => {
			expect(calculateLineItemTotalTaxRate(get("lineItem"))).toBe(0.1);
		});
	});
});
