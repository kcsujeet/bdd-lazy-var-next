import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { def, get, subject } from "bdd-lazy-var-next/jest";
import { Counter, type CounterProps } from "../src/Counter";
import {
	type User,
	UserProfile,
	type UserProfileProps,
} from "../src/UserProfile";

// NOTE: Jest adapter currently has a limitation where nested describe blocks
// cannot redefine variables from parent describes. This is a known issue.
// For now, each test suite uses unique variable names.

describe("Counter Component - Basic", () => {
	// Define props with type safety
	def("counterProps", () => ({
		initialCount: 0,
		label: "Count",
	}));

	// Subject: the rendered component
	subject("counter", () =>
		render(<Counter {...get<CounterProps>("counterProps")} />),
	);

	it("renders with default count", () => {
		get("counter"); // Render the component
		expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 0");
	});

	it("increments the counter", async () => {
		get("counter");
		const incrementButton = screen.getByTestId("increment");

		await userEvent.click(incrementButton);
		expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 1");

		await userEvent.click(incrementButton);
		expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 2");
	});

	it("decrements the counter", async () => {
		get("counter");
		const decrementButton = screen.getByTestId("decrement");

		await userEvent.click(decrementButton);
		expect(screen.getByTestId("count-label")).toHaveTextContent("Count: -1");
	});

	it("resets the counter", async () => {
		get("counter");

		// Increment a few times
		await userEvent.click(screen.getByTestId("increment"));
		await userEvent.click(screen.getByTestId("increment"));
		expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 2");

		// Reset
		await userEvent.click(screen.getByTestId("reset"));
		expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 0");
	});
});

describe("Counter Component - Custom Initial Count", () => {
	def("customCounterProps", () => ({
		initialCount: 10,
		label: "Count",
	}));

	subject("customCounter", () =>
		render(<Counter {...get<CounterProps>("customCounterProps")} />),
	);

	it("starts at the custom count", () => {
		get("customCounter");
		expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 10");
	});

	it("increments from custom count", async () => {
		get("customCounter");
		await userEvent.click(screen.getByTestId("increment"));
		expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 11");
	});
});

describe("Counter Component - Custom Label", () => {
	def("labeledCounterProps", () => ({
		initialCount: 0,
		label: "Score",
	}));

	subject("labeledCounter", () =>
		render(<Counter {...get<CounterProps>("labeledCounterProps")} />),
	);

	it("displays custom label", () => {
		get("labeledCounter");
		expect(screen.getByTestId("count-label")).toHaveTextContent("Score: 0");
	});
});

describe("UserProfile Component - Basic", () => {
	// Type-safe user definition
	def("user", () => ({
		id: 1,
		name: "John Doe",
		email: "john@example.com",
		role: "user" as const,
	}));

	def("onEdit", () => jest.fn());
	def("onDelete", () => jest.fn());

	def("profileProps", () => ({
		user: get<User>("user"),
		onEdit: get("onEdit"),
		onDelete: get("onDelete"),
	}));

	subject("profile", () =>
		render(<UserProfile {...get<UserProfileProps>("profileProps")} />),
	);

	it("renders user information", () => {
		get("profile");
		expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
		expect(screen.getByTestId("user-email")).toHaveTextContent(
			"john@example.com",
		);
		expect(screen.getByTestId("user-role")).toHaveTextContent("Role: user");
	});

	it("calls onEdit when edit button is clicked", async () => {
		get("profile");
		const editButton = screen.getByTestId("edit-button");

		await userEvent.click(editButton);
		expect(get("onEdit")).toHaveBeenCalledTimes(1);
	});

	it("calls onDelete when delete button is clicked", async () => {
		get("profile");
		const deleteButton = screen.getByTestId("delete-button");

		await userEvent.click(deleteButton);
		expect(get("onDelete")).toHaveBeenCalledTimes(1);
	});
});

describe("UserProfile Component - Admin User", () => {
	def("adminUser", () => ({
		id: 2,
		name: "Admin User",
		email: "admin@example.com",
		role: "admin" as const,
	}));

	def("adminProfileProps", () => ({
		user: get<User>("adminUser"),
	}));

	subject("adminProfile", () =>
		render(<UserProfile {...get<UserProfileProps>("adminProfileProps")} />),
	);

	it("displays admin role", () => {
		get("adminProfile");
		expect(screen.getByTestId("user-role")).toHaveTextContent("Role: admin");
		expect(screen.getByTestId("user-name")).toHaveTextContent("Admin User");
	});
});

describe("UserProfile Component - Without Handlers", () => {
	def("userWithoutHandlers", () => ({
		id: 1,
		name: "John Doe",
		email: "john@example.com",
		role: "user" as const,
	}));

	def("profilePropsWithoutHandlers", () => ({
		user: get<User>("userWithoutHandlers"),
	}));

	subject("profileWithoutHandlers", () =>
		render(
			<UserProfile {...get<UserProfileProps>("profilePropsWithoutHandlers")} />,
		),
	);

	it("does not render action buttons", () => {
		get("profileWithoutHandlers");
		expect(screen.queryByTestId("edit-button")).not.toBeInTheDocument();
		expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
	});
});

describe("Type-safe React Testing Examples", () => {
	interface TestUser {
		name: string;
		age: number;
	}

	def("testUser", () => ({
		name: "Alice",
		age: 30,
	}));

	it("demonstrates type-safe variable access", () => {
		// Use explicit type parameter for type safety
		const user = get<TestUser>("testUser");
		expect(user.name).toBe("Alice");
		expect(user.age).toBe(30);
	});

	it("demonstrates type inference with annotations", () => {
		// TypeScript infers type from annotation
		const user: TestUser = get("testUser");
		expect(user.name).toBe("Alice");
		expect(user.age).toBe(30);
	});
});
