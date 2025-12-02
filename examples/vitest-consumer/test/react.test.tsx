import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { def, get, subject } from "bdd-lazy-var-next/vitest";
import { Counter, type CounterProps } from "../src/Counter";
import { UserProfile, type User, type UserProfileProps } from "../src/UserProfile";

describe("Counter Component", () => {
  // Define props with type safety
  def("counterProps", () => ({
    initialCount: get<number>("initialCount"),
    label: get<string>("label"),
  }));

  def("initialCount", () => 0);
  def("label", () => "Count");

  // Subject: the rendered component
  subject("counter", () => render(<Counter {...get<CounterProps>("counterProps")} />));

  it("renders with default count", () => {
    subject(); // Render the component
    expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 0");
  });

  it("increments the counter", async () => {
    subject();
    const incrementButton = screen.getByTestId("increment");

    await userEvent.click(incrementButton);
    expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 1");

    await userEvent.click(incrementButton);
    expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 2");
  });

  it("decrements the counter", async () => {
    subject();
    const decrementButton = screen.getByTestId("decrement");

    await userEvent.click(decrementButton);
    expect(screen.getByTestId("count-label")).toHaveTextContent("Count: -1");
  });

  it("resets the counter", async () => {
    subject();

    // Increment a few times
    await userEvent.click(screen.getByTestId("increment"));
    await userEvent.click(screen.getByTestId("increment"));
    expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 2");

    // Reset
    await userEvent.click(screen.getByTestId("reset"));
    expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 0");
  });

  describe("with custom initial count", () => {
    def("initialCount", () => 10);

    it("starts at the custom count", () => {
      subject();
      expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 10");
    });

    it("increments from custom count", async () => {
      subject();
      await userEvent.click(screen.getByTestId("increment"));
      expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 11");
    });
  });

  describe("with custom label", () => {
    def("label", () => "Score");

    it("displays custom label", () => {
      subject();
      expect(screen.getByTestId("count-label")).toHaveTextContent("Score: 0");
    });
  });
});

describe("UserProfile Component", () => {
  // Type-safe user definition
  def("user", () => ({
    id: get<number>("userId"),
    name: get<string>("userName"),
    email: get<string>("userEmail"),
    role: get<"admin" | "user" | "guest">("userRole"),
  }));

  def("userId", () => 1);
  def("userName", () => "John Doe");
  def("userEmail", () => "john@example.com");
  def("userRole", () => "user" as const);

  def("onEdit", () => vi.fn());
  def("onDelete", () => vi.fn());

  def("profileProps", () => ({
    user: get<User>("user"),
    onEdit: get("onEdit"),
    onDelete: get("onDelete"),
  }));

  subject("profile", () => render(<UserProfile {...get<UserProfileProps>("profileProps")} />));

  it("renders user information", () => {
    subject();
    expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("user-email")).toHaveTextContent("john@example.com");
    expect(screen.getByTestId("user-role")).toHaveTextContent("Role: user");
  });

  it("calls onEdit when edit button is clicked", async () => {
    subject();
    const editButton = screen.getByTestId("edit-button");

    await userEvent.click(editButton);
    expect(get("onEdit")).toHaveBeenCalledTimes(1);
  });

  it("calls onDelete when delete button is clicked", async () => {
    subject();
    const deleteButton = screen.getByTestId("delete-button");

    await userEvent.click(deleteButton);
    expect(get("onDelete")).toHaveBeenCalledTimes(1);
  });

  describe("admin user", () => {
    def("userName", () => "Admin User");
    def("userRole", () => "admin" as const);

    it("displays admin role", () => {
      subject();
      expect(screen.getByTestId("user-role")).toHaveTextContent("Role: admin");
      expect(screen.getByTestId("user-name")).toHaveTextContent("Admin User");
    });
  });

  describe("without edit and delete handlers", () => {
    def("profileProps", () => ({
      user: get<User>("user"),
    }));

    it("does not render action buttons", () => {
      subject();
      expect(screen.queryByTestId("edit-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();
    });
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
