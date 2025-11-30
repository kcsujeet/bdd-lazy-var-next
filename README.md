# BDD + lazy variable definition (aka rspec)

> **Note**: This is a community-maintained fork of the original [bdd-lazy-var](https://github.com/stalniy/bdd-lazy-var) with added support for Vitest and Bun test frameworks.

[![NPM version](https://badge.fury.io/js/bdd-lazy-var-next.svg)](http://badge.fury.io/js/bdd-lazy-var-next)
[![CI](https://github.com/kcsujeet/bdd-lazy-var-next/workflows/CI/badge.svg)](https://github.com/kcsujeet/bdd-lazy-var-next/actions)
[![GitHub](https://img.shields.io/github/license/kcsujeet/bdd-lazy-var-next)](https://github.com/kcsujeet/bdd-lazy-var-next/blob/master/LICENSE)

Provides helpers for testing frameworks such as [bun:test][bun], [vitest][vitest], [jest][jest], [mocha][mocha] and [jasmine][jasmine] which allows to define lazy variables and subjects.

> [!WARNING] > **Breaking Changes from `bdd-lazy-var`**
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
  },
});
```

```ts
// setup.ts
import "bdd-lazy-var-next/vitest";
```

### Jest

**Option 1: Explicit Imports (Recommended)**

```js
import { get, def } from "bdd-lazy-var-next/jest";
```

**Option 2: Global Variables**

Add to your `jest.config.js`:

```js
module.exports = {
  setupFilesAfterEnv: ["bdd-lazy-var-next/jest"],
};
```

### Mocha

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

<details>
  <summary>Example: Shared Examples</summary>

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

</details>

## TypeScript Support

It's also possible to use `bdd-lazy-var-next` with TypeScript.

<details>
  <summary>tsconfig.json</summary>

```json
{
  "compilerOptions": {
    // ...
  },
  "include": ["src/**/*", "node_modules/bdd-lazy-var-next/index.d.ts"]
}
```

</details>

When using explicit imports, TypeScript loads corresponding declarations automatically:

```ts
import { get, def } from "bdd-lazy-var-next/bun";
```

## Motivation: Why the new way rocks

### No more global leaks

Because lazy vars are cleared after each test, we didn't have to worry about test pollution anymore. This helped ensure isolation between our tests, making them a lot more reliable.

### Clear meaning

Every time I see a `get('<variable>')` reference in my tests, I know where it's defined. That, coupled with removing exhaustive `var` declarations in `describe` blocks, have made even my largest tests clear and understandable.

### The old way (for comparison)

<details>
  <summary>Click to see the old, messy way</summary>

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

</details>

## Want to help?

Want to file a bug, contribute some code, or improve documentation? Excellent! Read up on guidelines for [contributing][contributing]

## License

[MIT License](http://www.opensource.org/licenses/MIT)

[mocha]: https://mochajs.org
[jasmine]: https://jasmine.github.io/2.0/introduction.html
[jest]: https://facebook.github.io/jest/docs/en/getting-started.html
[vitest]: https://vitest.dev
[bun]: https://bun.sh/docs/cli/test
[contributing]: https://github.com/kcsujeet/bdd-lazy-var-next/blob/master/CONTRIBUTING.md
