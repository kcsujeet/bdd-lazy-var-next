import { afterEach, expect } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

expect.extend(matchers);

// Cleans up `render` after each test to prevent memory leaks
afterEach(() => {
	cleanup();
});
