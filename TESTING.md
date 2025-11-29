# Testing bdd-lazy-var-next with Vitest and Bun

## Quick Test Guide

### Testing with Vitest

1. **Install Vitest** (if not already installed):

   ```bash
   npm install -D vitest
   # or
   bun add -d vitest
   ```

2. **Create a simple test file** (`test-vitest.spec.js`):

   ```javascript
   import { describe, it, expect, beforeEach } from "vitest";
   import { def, get, subject } from "./index.js";

   describe("bdd-lazy-var with Vitest", () => {
     def("name", () => "John");
     def("age", () => 25);

     subject(() => ({ name: get("name"), age: get("age") }));

     it("should define lazy variables", () => {
       expect(get("name")).toBe("John");
       expect(get("age")).toBe(25);
     });

     it("should work with subject", () => {
       expect(subject()).toEqual({ name: "John", age: 25 });
     });
   });
   ```

3. **Run the test**:
   ```bash
   npm run test.vitest
   # or for a single file
   npx vitest run test-vitest.spec.js
   ```

### Testing with Bun

1. **Make sure Bun is installed**:

   ```bash
   bun --version
   ```

2. **Create a simple test file** (`test-bun.test.js`):

   ```javascript
   import { describe, it, expect } from "bun:test";
   import { def, get, subject } from "./index.js";

   describe("bdd-lazy-var with Bun", () => {
     def("greeting", () => "Hello");
     def("name", () => "World");

     subject(() => `${get("greeting")} ${get("name")}`);

     it("should define lazy variables", () => {
       expect(get("greeting")).toBe("Hello");
       expect(get("name")).toBe("World");
     });

     it("should work with subject", () => {
       expect(subject()).toBe("Hello World");
     });
   });
   ```

3. **Run the test**:
   ```bash
   npm run test.bun
   # or
   bun test test-bun.test.js
   ```

## Testing with Global Dialect ($varName)

### Vitest with Global Dialect

Create `vitest.config.js`:

```javascript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./global.js"],
  },
});
```

Test file (`test-global-vitest.spec.js`):

```javascript
import { describe, it, expect } from "vitest";

describe("bdd-lazy-var global dialect", () => {
  def("value", () => 42);
  subject(() => $value * 2);

  it("should use $varName syntax", () => {
    expect($value).toBe(42);
    expect($subject).toBe(84);
  });
});
```

### Bun with Global Dialect

Test file with preload (`test-global-bun.test.js`):

```javascript
import { describe, it, expect } from "bun:test";

describe("bdd-lazy-var global dialect", () => {
  def("value", () => 42);
  subject(() => $value * 2);

  it("should use $varName syntax", () => {
    expect($value).toBe(42);
    expect($subject).toBe(84);
  });
});
```

Run with:

```bash
bun test --preload ./global.js test-global-bun.test.js
```

## Quick Smoke Test

Run this command to test if the basic integration works:

```bash
# Test Vitest
echo "import { describe, it, expect } from 'vitest'; import { def, get } from './index.js'; describe('smoke', () => { def('x', () => 5); it('works', () => expect(get('x')).toBe(5)) })" > /tmp/vitest-smoke.test.js && npx vitest run /tmp/vitest-smoke.test.js

# Test Bun (requires build first)
npm run build && echo "import { describe, it, expect } from 'bun:test'; import { def, get } from './index.js'; describe('smoke', () => { def('x', () => 5); it('works', () => expect(get('x')).toBe(5)) })" > /tmp/bun-smoke.test.js && bun test /tmp/bun-smoke.test.js
```

## Running Full Test Suite

To run the existing test suite with the new frameworks:

```bash
# Build the library first
npm run build

# Run Vitest tests
npm run test.vitest-ui
npm run test.vitest-global
npm run test.vitest-getter

# Run Bun tests
npm run test.bun-ui
npm run test.bun-global
npm run test.bun-getter
```

## Troubleshooting

### Vitest says module not found

- Make sure you've built the library: `npm run build`
- Check that `index.js`, `global.js`, and `getter.js` exist in the root

### Bun test fails

- Ensure Bun is installed: `curl -fsSL https://bun.sh/install | bash`
- Build the library first: `npm run build`
- Check framework detection by adding: `console.log(typeof Bun, typeof Bun.jest)`

### Variables are undefined

- For global dialect, ensure you're loading `global.js` in setup
- For getter dialect, ensure you're loading `getter.js`
- Check that `def()` is called before accessing variables
