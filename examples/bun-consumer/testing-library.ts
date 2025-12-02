import { afterEach, expect } from "bun:test";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

// Cleans up `render` after each test to prevent memory leaks
afterEach(() => {
  cleanup();
});
