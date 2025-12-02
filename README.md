# BDD + lazy variable definition (aka rspec)

> **Note**: This is a fork of the original [bdd-lazy-var](https://github.com/stalniy/bdd-lazy-var) with added support for Vitest and Bun test frameworks.

[![NPM version](https://badge.fury.io/js/bdd-lazy-var-next.svg)](http://badge.fury.io/js/bdd-lazy-var-next)
[![CI](https://github.com/kcsujeet/bdd-lazy-var-next/workflows/CI/badge.svg)](https://github.com/kcsujeet/bdd-lazy-var-next/actions)
[![GitHub](https://img.shields.io/github/license/kcsujeet/bdd-lazy-var-next)](https://github.com/kcsujeet/bdd-lazy-var-next/blob/master/LICENSE)

Provides helpers for testing frameworks such as [bun:test][bun], [vitest][vitest], [jest][jest], [mocha][mocha] and [jasmine][jasmine] which allows to define lazy variables and subjects.

> ⚠️ [!WARNING] > **Breaking Changes from `bdd-lazy-var`**
>
> If you are migrating from the original library, please note the following critical changes:
>
> 1. **No Auto-Detection**: You **must** import from the specific framework entry point (e.g., `bdd-lazy-var-next/bun`, `bdd-lazy-var-next/jest`). The generic `bdd-lazy-var` import is not supported.
> 2. **Explicit Imports**: We strongly recommend using explicit imports (`import { get, def } from ...`) over global variables.
> 3. **Native ESM**: This library is published as native ESM. Ensure your environment supports ESM.
> 4. **Removed `its` Shortcut**: The `its` shortcut and `is.expected` helper have been removed to simplify the API and reduce maintenance. Use standard `it` blocks with assertions instead.

## Installation

```bash
npm install bdd-lazy-var-next --save-dev
# or
bun add -d bdd-lazy-var-next
```

## Setup & Configuration

**Important**: Unlike the original `bdd-lazy-var`, this library requires you to import the specific entry point for your testing framework.

### Bun

**Option 1: Explicit Imports (Recommended)**

```ts
import { get, def, subject } from "bdd-lazy-var-next/bun";

describe("My Bun Test", () => {
  def("value", () => 1);
  // ...
});
```

**Option 2: Global Variables**

Import the library once (e.g. in setup) to register globals:

```ts
import "bdd-lazy-var-next/bun";

describe("My Bun Test", () => {
  def("value", () => 1); // Available globally
});
```

Or add it to your `bunfig.toml` preload:

```toml
[test]
preload = ["./setup.ts"]
```

```ts
// setup.ts
import "bdd-lazy-var-next/bun";
```

**Bun Test Isolation**

Bun runs all test files in a shared global context. This means global variable definitions (e.g., `def('foo')`) can collide across files, causing errors like "Cannot define variable twice".

**Solutions:**

- Define variables inside `describe` only
- Use unique variable names or suite names in each test file.

**Example:**

[Bun Consumer Example](./examples/bun-consumer/)

### Vitest

**Option 1: Explicit Imports (Recommended)**

```ts
import { get, def } from "bdd-lazy-var-next/vitest";
```

**Option 2: Global Variables**

Add to your `vitest.config.ts` setup files:

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    setupFiles: ["./setup.ts"],
    globals: true,
  },
});
```

```ts
// setup.ts
import "bdd-lazy-var-next/vitest";
```

**Example:**

[Vitest Consumer Example](./examples/vitest-consumer/)

### Jest

> 🚨 **CAUTION:** Do yourself a favor and migrate to [Vitest](https://vitest.dev) or [Bun test](https://bun.com/docs/test). Jest is slow, has poor ESM support, and is no longer actively innovated. Don't use Jest.

**Option 1: Explicit Imports (Recommended)**

```js
import { get, def } from "bdd-lazy-var-next/jest";
```

**Option 2: Global Variables**

Add to your `jest.config.ts`:

```ts
// jest.config.ts
import type { Config } from "jest";

const config: Config = {
  setupFilesAfterEnv: ["./setup.ts"],
  // ... other config
};

export default config;
```

```ts
// setup.ts
import "bdd-lazy-var-next/jest";
```

**Example:**

[Jest Consumer Example](./examples/jest-consumer/)

### Mocha

> 🚨 **CAUTION:** Do yourself a favor and migrate to [Vitest](https://vitest.dev) or [Bun test](https://bun.com/docs/test). Mocha is outdated and lacks modern features like native ESM support, built-in TypeScript, and parallel testing. Don't use Mocha.

**Option 1: Explicit Imports (Recommended)**

```js
import { get, def } from "bdd-lazy-var-next/mocha";
```

**Option 2: Global Variables**

You can require it globally via command line:

```bash
mocha -r bdd-lazy-var-next/mocha
```

Or import it in your test/setup file:

```js
import "bdd-lazy-var-next/mocha";
```

### Jasmine

> 🚨 **CAUTION:** Do yourself a favor and migrate to [Vitest](https://vitest.dev) or [Bun test](https://bun.com/docs/test). Jasmine is legacy technology with poor ESM support and minimal modern tooling integration. Don't use Jasmine.

**Option 1: Explicit Imports (Recommended)**

```js
import { get, def } from "bdd-lazy-var-next/jasmine";
```

**Option 2: Global Variables**

Create a helper file (e.g., `spec/helpers/bdd-lazy-var.js`) or import it in your spec file:

```js
import "bdd-lazy-var-next/jasmine";
```

And ensure it's included in your `jasmine.json` helpers list.

## Usage Guide

### Basic Usage

The core concept is defining variables that are lazily evaluated and automatically cleaned up.

```js
import { get, def } from "bdd-lazy-var-next/bun"; // or /vitest, /jest, /mocha, /jasmine

describe("Suite", () => {
  // Define a variable 'name'
  def("name", () => `John Doe ${Math.random()}`);

  it("defines `name` variable", () => {
    // Access it using get()
    expect(get("name")).to.exist;
  });

  it("does not use name, so it is not created", () => {
    expect(1).to.equal(1);
  });
});
```

### Lazy Evaluation

Variables are instantiated only when referenced. That means if you don't use variable inside your test it won't be evaluated, making your tests run faster.

### Composition

Due to laziness we are able to compose variables. This allows to define more general variables at the top level and more specific at the bottom:

```js
describe('User', function() {
  subject('user', () => new User(get('props')))

  describe('when user is "admin"', function() {
    def('props', () => ({ role: 'admin' }))

    it('can update articles', function() {
      // user is created with property role equal "admin"
      expect(get('user')).to....
    })
  })

  describe('when user is "member"', function() {
    def('props', () => ({ role: 'member' }))

    it('cannot update articles', function() {
      // user is created with property role equal "member"
      expect(get('user')).to....
    })
  })
})
```

### Named Subjects

You can give your subject a name to reference it explicitly, or use the default `subject` alias.

```js
describe("Array", () => {
  subject("collection", () => [1, 2, 3]);

  it("has 3 elements by default", () => {
    expect(get("subject")).to.equal(get("collection"));
    expect(get("collection")).to.have.length(3);
  });
});
```

## Advanced Features

### Shared Examples

Very often you may find that some behavior repeats (e.g., when you implement Adapter pattern), and you would like to reuse tests for a different class or object.

- `sharedExamplesFor` - defines a set of reusable tests.
- `includeExamplesFor` - runs previously defined examples in current context (i.e., in current `describe`).
- `itBehavesLike` - runs defined examples in nested context (i.e., in nested `describe`).

**WARNING**: files containing shared examples must be loaded before the files that use them.

```js
sharedExamplesFor("a collection", (size) => {
  it("has correct size", () => {
    expect(get("subject").size).to.equal(size);
  });
});

describe("Set", () => {
  subject(() => new Set([1, 2, 7]));
  itBehavesLike("a collection", 3);
});

describe("Map", () => {
  subject(() => new Map([[2, 1]]));
  itBehavesLike("a collection", 1);
});
```

## TypeScript Support

`bdd-lazy-var-next` includes full TypeScript support with generic types for type-safe variable definitions and access.

### Configuration

The library uses `package.json` `exports` field to provide framework-specific entry points (`./bun`, `./jest`, `./vitest`, etc.). Your TypeScript configuration needs to support this.

#### For Node.js / Backend Projects (Recommended)

Use `NodeNext` for the most complete and reliable support:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "isolatedModules": true
    // ... other options
  }
  // ... other options
}
```

**Why `NodeNext`?**

- Fully supports `package.json` `exports` field with conditional exports
- Correctly resolves the `types` field for subpath imports like `bdd-lazy-var-next/jest`
- Best option for Node.js, Bun, Jest, Mocha testing environments

#### For Frontend / Bundler Projects

If you're using Vite, Webpack, or other bundlers (e.g., for Vitest in a frontend app), you can use:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "isolatedModules": true
    // ... other options
  }
  // ... other options
}
```

</details>

**Note:** `bundler` moduleResolution should work for most cases, but if you encounter type resolution issues with subpath imports, switch to `NodeNext`.

### Basic Usage

When using explicit imports, TypeScript loads corresponding declarations automatically:

```ts
import { get, def } from "bdd-lazy-var-next/bun";
```

For global usage (preload/setup files), the types are available globally after importing:

```ts
// setup.ts
import "bdd-lazy-var-next/bun";

// In test files, no import needed:
describe("test", () => {
  def("value", () => 42); // TypeScript knows about def, get, etc.
});
```

### Type-Safe Variables

All functions (`def`, `get`, `subject`) support TypeScript generics for type safety.

#### Method 1: Explicit Type Parameters (Recommended)

Specify the type when calling `get()` for full type safety:

```ts
import { def, get } from "bdd-lazy-var-next/bun";

// Define your types
interface User {
  name: string;
  age: number;
  email: string;
}

// Define variables (types are optional here)
def("userName", () => "John Doe");
def("user", () => ({
  name: "John Doe",
  age: 30,
  email: "john@example.com",
}));
def("scores", () => [95, 87, 92, 88]);

// Get variables with explicit type parameters
const userName = get<string>("userName");
console.log(userName.toUpperCase()); // Type-safe string methods ✓

const user = get<User>("user");
console.log(user.email); // Type-safe property access ✓

const scores = get<number[]>("scores");
const average = scores.reduce((a, b) => a + b, 0) / scores.length; // ✓
```

#### Method 2: Variable Type Annotations

Let TypeScript infer from your variable declaration:

```ts
// TypeScript infers the type from the annotation
const userName: string = get("userName");
console.log(userName.toUpperCase()); // Works!

const user: User = get("user");
console.log(user.email); // Works!

const scores: number[] = get("scores");
console.log(scores.length); // Works!
```

#### Typing `def()` (Optional)

You can also add types to `def()` for consistency:

```ts
// Type the definition function
def<string>("userName", () => "John Doe");
def<User>("user", () => ({
  name: "John Doe",
  age: 30,
  email: "john@example.com",
}));
def<number[]>("scores", () => [95, 87, 92, 88]);
```

#### Type-Safe `subject()`

Define and access subjects with types:

```ts
import { subject } from "bdd-lazy-var-next/bun";

describe("User", () => {
  // Named subject with type
  subject<User>("currentUser", () => ({
    name: "Jane Smith",
    age: 25,
    email: "jane@example.com",
  }));

  it("has correct properties", () => {
    // Access with type safety
    const user = subject<User>();
    expect(user.name).toBe("Jane Smith");
  });
});

describe("Array operations", () => {
  // Anonymous subject with type
  subject<number[]>(() => [1, 2, 3, 4, 5]);

  it("calculates sum", () => {
    const numbers = subject<number[]>();
    const sum = numbers.reduce((a, b) => a + b, 0);
    expect(sum).toBe(15);
  });
});
```

#### Advanced Type Usage

You can use any TypeScript type, including generics and unions:

```ts
// Generic types
def<Record<string, number>>("scores", () => ({
  math: 95,
  science: 87,
  english: 92,
}));

// Union types
def<"active" | "inactive" | "pending">("status", () => "active");

// Function types
def<(x: number) => number>("double", () => (x) => x * 2);

// Promise types
def<Promise<User>>("asyncUser", async () => {
  return await fetchUser();
});
```

### Type Safety Benefits

1. **Compile-time type checking**: Catch type errors before runtime
2. **IntelliSense support**: Get autocomplete and inline documentation
3. **Refactoring safety**: TypeScript will flag issues when types change
4. **Self-documenting code**: Types serve as inline documentation

### Complete Example with Type Safety

```ts
import { describe, it, expect } from "bun:test";
import { def, get, subject } from "bdd-lazy-var-next/bun";

interface Product {
  id: number;
  name: string;
  price: number;
}

describe("Shopping Cart", () => {
  def("products", () => [
    { id: 1, name: "Laptop", price: 999 },
    { id: 2, name: "Mouse", price: 25 },
  ]);

  def("quantities", () => [1, 2]);

  subject("totalPrice", () => {
    // Use explicit type parameters for type safety
    const products = get<Product[]>("products");
    const quantities = get<number[]>("quantities");

    return products.reduce((total, product, index) => {
      return total + product.price * quantities[index];
    }, 0);
  });

  it("calculates total price correctly", () => {
    const total = subject<number>();
    expect(total).toBe(1049); // 999*1 + 25*2
  });

  it("has type-safe property access", () => {
    const products = get<Product[]>("products");

    // TypeScript knows products is Product[]
    expect(products[0].name).toBe("Laptop"); // ✓ Type-safe!
    expect(products[0].price).toBe(999);     // ✓ Autocomplete works!
    expect(products.length).toBe(2);
  });

  it("alternative: using variable type annotations", () => {
    // You can also use type annotations instead of explicit parameters
    const products: Product[] = get("products");
    const quantities: number[] = get("quantities");

    expect(products.length).toBe(2);
    expect(quantities.length).toBe(2);
  });
});
```

### React Testing Library Example

`bdd-lazy-var-next` works perfectly with React Testing Library for component testing:

<details>
<summary><strong>Bun Example</strong></summary>

```tsx
import { describe, it, expect, mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { def, get, subject } from "bdd-lazy-var-next/bun";
import { UserProfile, type User } from "./UserProfile";

describe("UserProfile Component", () => {
  // Define user with type safety
  def("user", () => ({
    id: get<number>("userId"),
    name: get<string>("userName"),
    email: get<string>("userEmail"),
    role: get<"admin" | "user">("userRole"),
  }));

  def("userId", () => 1);
  def("userName", () => "John Doe");
  def("userEmail", () => "john@example.com");
  def("userRole", () => "user" as const);

  def("onEdit", () => mock(() => {}));
  def("onDelete", () => mock(() => {}));

  // Subject: render the component
  subject("profile", () =>
    render(
      <UserProfile
        user={get<User>("user")}
        onEdit={get("onEdit")}
        onDelete={get("onDelete")}
      />
    )
  );

  it("renders user information", () => {
    subject();
    expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("user-email")).toHaveTextContent("john@example.com");
  });

  it("calls onEdit when clicked", async () => {
    subject();
    await userEvent.click(screen.getByTestId("edit-button"));
    expect(get("onEdit")).toHaveBeenCalledTimes(1);
  });

  describe("admin user", () => {
    def("userName", () => "Admin User");
    def("userRole", () => "admin" as const);

    it("displays admin role", () => {
      subject();
      expect(screen.getByTestId("user-role")).toHaveTextContent("Role: admin");
    });
  });
});
```

</details>

<details>
<summary><strong>Vitest Example</strong></summary>

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { def, get, subject } from "bdd-lazy-var-next/vitest";
import { Counter } from "./Counter";

describe("Counter Component", () => {
  def("counterProps", () => ({
    initialCount: get<number>("initialCount"),
    label: get<string>("label"),
  }));

  def("initialCount", () => 0);
  def("label", () => "Count");

  subject("counter", () => render(<Counter {...get("counterProps")} />));

  it("renders with default count", () => {
    subject();
    expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 0");
  });

  it("increments the counter", async () => {
    subject();
    await userEvent.click(screen.getByTestId("increment"));
    expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 1");
  });

  describe("with custom initial count", () => {
    def("initialCount", () => 10);

    it("starts at the custom count", () => {
      subject();
      expect(screen.getByTestId("count-label")).toHaveTextContent("Count: 10");
    });
  });
});
```

</details>

**Key Benefits for React Testing:**

1. **DRY Component Setup**: Define props once, reuse in nested contexts
2. **Easy Overrides**: Override specific props in nested describe blocks
3. **Type Safety**: Full TypeScript support with React components
4. **Clean Tests**: Focus on behavior, not setup boilerplate
5. **Lazy Rendering**: Components only render when `subject()` is called

**Important: Prevent Memory Leaks**

When using React Testing Library with `bdd-lazy-var-next`, you **must** add cleanup to prevent memory leaks:

**For Bun:**
```ts
// setup.ts
import { cleanup } from "@testing-library/react";
import { afterEach } from "bun:test";

afterEach(() => {
  cleanup();
});
```

**For Vitest:**
```ts
// setup.ts
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

**Why this matters:**

Without cleanup, rendered components accumulate in memory across tests, causing:
- 🐌 **Slow test execution** (especially noticeable in Vitest)
- 💾 **Memory leaks** from accumulated DOM nodes and React instances
- ❌ **Test interference** from leftover state

The memory leak is particularly bad when using `subject()` with `render()` because each test renders a component that stays mounted unless explicitly cleaned up.

## Bun Advanced Usage & Troubleshooting

### Local Development & Linking

When testing changes in a local consumer project (e.g., `examples/bun-consumer`), you may want to link the package locally:

```json
// package.json
"dependencies": {
  "bdd-lazy-var-next": "file:../../"
}
```

**Note:** Linking with `file:../../` will copy the entire repo, including `node_modules`, which can be slow. For faster linking, use a minimal package or run `npm pack`/`bun pack` in the main repo and link the resulting `.tgz` file:

```bash
cd /Users/sujeetkc1/Desktop/bdd-lazy-var-next
bun run build
bun pack # or npm pack
# Then in consumer project:
bun add ../bdd-lazy-var-next/bdd-lazy-var-next-x.y.z.tgz
```

### Preload Setup for Bun

To register globals for all tests, use Bun's preload feature in `bunfig.toml`:

```toml
[test]
preload = ["./setup.ts"]
```

```ts
// setup.ts
import "bdd-lazy-var-next/bun";
```

### Troubleshooting

- **Double Initialization Error:** If you see errors about variables being defined twice, ensure you are not importing the library globally in multiple places, and use unique variable names per test file.
- **Local Linking Slow:** Use a packed `.tgz` file for local development to avoid copying the entire repo.
- **TypeScript Types:** Ensure your `tsconfig.json` includes the correct type paths for Bun and the library.

## Motivation: Why the new way rocks

### No more global leaks

Because lazy vars are cleared after each test, we didn't have to worry about test pollution anymore. This helped ensure isolation between our tests, making them a lot more reliable.

### Clear meaning

Every time I see a `get('<variable>')` reference in my tests, I know where it's defined. That, coupled with removing exhaustive `var` declarations in `describe` blocks, have made even my largest tests clear and understandable.

### The old way (for comparison)

```js
describe("Suite", function () {
  var name;

  beforeEach(function () {
    name = getName();
  });

  afterEach(function () {
    name = null;
  });

  it("uses name variable", function () {
    expect(name).to.exist;
  });
});
```

This pattern becomes difficult as tests grow, leading to "variable soup" and potential leaks.

## Want to help?

Want to file a bug, contribute some code, or improve documentation? Excellent! Read up on guidelines for [contributing][contributing]

## License

[MIT License](http://www.opensource.org/licenses/MIT)

[mocha]: https://mochajs.org
[jasmine]: https://jasmine.github.io/2.0/introduction.html
[jest]: https://facebook.github.io/jest/docs/en/getting-started.html
[vitest]: https://vitest.dev
[bun]: https://bun.com/docs/test
[contributing]: https://github.com/kcsujeet/bdd-lazy-var-next/blob/master/CONTRIBUTING.md
