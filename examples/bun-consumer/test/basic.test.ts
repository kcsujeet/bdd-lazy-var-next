import { describe, expect, it, mock } from "bun:test";
import { def, get, subject } from "bdd-lazy-var-next/bun";

// Example with complex types
interface User {
	name: string;
	age: number;
	email: string;
}

// Type-safe variable definitions
def("foo", () => "bar");
def("func", () => mock(() => "baz"));

def("user", () => ({
	name: "John Doe",
	age: 30,
	email: "john@example.com",
}));

// Example with arrays
def("numbers", () => [1, 2, 3, 4, 5]);

describe("Vite Consumer Basic", () => {
	it("returns correct value", () => {
		// Specify type when you need type safety
		const value = get<string>("foo");
		expect(value).toBe("bar");
	});

	it("mocks function correctly", () => {
		const res = get("func")();
		expect(res).toBe("baz");
		expect(get("func")).toHaveBeenCalled();
		expect(get("func")).toHaveBeenCalledTimes(1);
	});

	it("allows multiple calls to mocked function", () => {
		get("func")();
		get("func")();
		expect(get("func")).toHaveBeenCalledTimes(2);
	});
});

describe("Type-safe examples", () => {
	it("works with explicit type parameters", () => {
		// Specify the type to get type safety and autocomplete
		const value = get<string>("foo");
		expect(value).toBe("bar");
		expect(value.toUpperCase()).toBe("BAR"); // String methods work!
	});

	it("works with complex object types", () => {
		// Specify User type for type-safe property access
		const user = get<User>("user");
		expect(user.name).toBe("John Doe");
		expect(user.age).toBe(30);
		expect(user.email).toBe("john@example.com");
	});

	it("works with array types", () => {
		// Specify array type for type-safe array operations
		const numbers = get<number[]>("numbers");
		expect(numbers.length).toBe(5);
		expect(numbers.reduce((a, b) => a + b, 0)).toBe(15);
	});

	it("can infer type from variable annotation", () => {
		// TypeScript can infer from the variable type annotation
		const user: User = get("user");
		expect(user.name).toBe("John Doe");

		// This also works
		const value: string = get("foo");
		expect(value.toUpperCase()).toBe("BAR");
	});
});

describe("Subject examples", () => {
	// Named subject with type
	subject<string>("greeting", () => "Hello, World!");

	it("accesses typed subject", () => {
		const greeting = get<string>("subject");
		expect(greeting).toBe("Hello, World!");
	});

	describe("with complex type", () => {
		// Subject without name (uses default "subject")
		subject<User>(() => ({
			name: "Jane Smith",
			age: 25,
			email: "jane@example.com",
		}));

		it("accesses complex typed subject", () => {
			const user = subject<User>();
			expect(user.name).toBe("Jane Smith");
			expect(user.age).toBe(25);
		});
	});
});
