
def("foo", () => "bar");

describe("Jest Consumer Basic", () => {
	it("returns correct value", () => {
		expect(get("foo")).toBe("bar");
	});
});
