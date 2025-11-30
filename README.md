# BDD + lazy variable definition (aka rspec)

> **Note**: This is a community-maintained fork of the original [bdd-lazy-var](https://github.com/stalniy/bdd-lazy-var) with added support for Vitest and Bun test frameworks.

[![NPM version](https://badge.fury.io/js/bdd-lazy-var-next.svg)](http://badge.fury.io/js/bdd-lazy-var-next)
[![CI](https://github.com/kcsujeet/bdd-lazy-var-next/workflows/CI/badge.svg)](https://github.com/kcsujeet/bdd-lazy-var-next/actions)
[![GitHub](https://img.shields.io/github/license/kcsujeet/bdd-lazy-var-next)](https://github.com/kcsujeet/bdd-lazy-var-next/blob/master/LICENSE)

Provides "ui" for testing frameworks such as [mocha][mocha], [jasmine][jasmine], [jest][jest], [vitest][vitest] and [bun:test][bun] which allows to define lazy variables and subjects.

## Purpose

### The old way

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

  it("does not use name but anyway it is created in beforeEach", function () {
    expect(1).to.equal(1);
  });
});
```

### Why should it be improved?

Because as soon as amount of your tests increase, this pattern became increasingly difficult.
Sometimes you will find yourself jumping around spec files, trying to find out where a given variable was initially defined.
Or even worst, you may run into subtle bugs due to clobbering variables with common names (e.g. `model`, `view`) within a given scope, failing to realize they had already been defined.
Furthermore, declaration statements in `describe` blocks will start looking something like:

```js
var firstVar, secondVar, thirdVar, fourthVar, fifthVar, ..., nthVar
```

This is ugly and hard to parse. Finally, you can sometimes run into flaky tests due to "leaks" - test-specific variables that were not properly cleaned up after each case.

### The new, better way

In an attempt to address these issues, I had with my e2e tests, I decided to create this library, which allows to define suite specific variables in more elegant way.
So the original code above looks something like this:

```js
import { get, def } from "bdd-lazy-var-next/bun"; // or /vitest, /jest, /mocha, /jasmine

describe("Suite", () => {
  def("name", () => `John Doe ${Math.random()}`);

  it("defines `name` variable", () => {
    expect(get("name")).to.exist;
  });

  it("does not use name, so it is not created", () => {
    expect(1).to.equal(1);
  });
});
```

## Why the new way rocks

Switching over to this pattern has yielded a significant amount of benefits for us, including:

### No more global leaks

Because lazy vars are cleared after each test, we didn't have to worry about test pollution anymore. This helped ensure isolation between our tests, making them a lot more reliable.

### Clear meaning

Every time I see a `get('<variable>')` reference in my tests, I know where it's defined.
That, coupled with removing exhaustive `var` declarations in `describe` blocks, have made even my largest tests clear and understandable.

### Lazy evaluation

Variables are instantiated only when referenced.
That means if you don't use variable inside your test it won't be evaluated, making your tests to run faster.
No useless instantiation any more!

### Composition

Due to laziness we are able to compose variables. This allows to define more general varibles at the top level and more specific at the bottom:

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

## Tests reusage

Very often you may find that some behavior repeats (e.g., when you implement Adapter pattern),
and you would like to reuse tests for a different class or object.
To do this [Wiki of Mocha.js](https://github.com/mochajs/mocha/wiki/Shared-Behaviours) recommend to move your tests into separate function and call it whenever you need it.

I prefer to be more explicit in doing this, that's why created few helper methods:

- `sharedExamplesFor` - defines a set of reusable tests. When you call this function, it just stores your tests
- `includeExamplesFor` - runs previously defined examples in current context (i.e., in current `describe`)
- `itBehavesLike` - runs defined examples in nested context (i.e., in nested `describe`)

`sharedExamplesFor` defines shared examples in the scope of the currently defining suite.
If you call this function outside `describe` (or `context`) it defines shared examples globally.

**WARNING**: files containing shared examples must be loaded before the files that
use them.

#### Scenarios

<details>
  <summary>shared examples group included in two groups in one file</summary>

```js
sharedExamplesFor("a collection", () => {
  it("has three items", () => {
    expect(get("subject").size).to.equal(3);
  });

  describe("#has", () => {
    it("returns true with an item that is in the collection", () => {
      expect(get("subject").has(7)).to.be.true;
    });

    it("returns false with an item that is not in the collection", () => {
      expect(get("subject").has(9)).to.be.false;
    });
  });
});

describe("Set", () => {
  subject(() => new Set([1, 2, 7]));

  itBehavesLike("a collection");
});

describe("Map", () => {
  subject(
    () =>
      new Map([
        [2, 1],
        [7, 5],
        [3, 4],
      ])
  );

  itBehavesLike("a collection");
});
```

</details>

<details>
  <summary>Passing parameters to a shared example group</summary>

```js
sharedExamplesFor("a collection", (size, existingItem, nonExistingItem) => {
  it("has three items", () => {
    expect(get("subject").size).to.equal(size);
  });

  describe("#has", () => {
    it("returns true with an item that is in the collection", () => {
      expect(get("subject").has(existingItem)).to.be.true;
    });

    it("returns false with an item that is not in the collection", () => {
      expect(get("subject").has(nonExistingItem)).to.be.false;
    });
  });
});

describe("Set", () => {
  subject(() => new Set([1, 2, 7]));

  itBehavesLike("a collection", 3, 2, 10);
});

describe("Map", () => {
  subject(() => new Map([[2, 1]]));

  itBehavesLike("a collection", 1, 2, 3);
});
```

</details>

<details>
  <summary>Passing lazy vars to a shared example group</summary>

There are 2 ways how to pass lazy variables:

- all variables are inherited by nested contexts (i.e., `describe` calls),
  so you can rely on variable name, as it was done with `subject` in previous examples
- you can pass variable definition using `get.variable` helper

```js
sharedExamplesFor("a collection", (collection) => {
  def("collection", collection);

  it("has three items", () => {
    expect(get("collection").size).to.equal(1);
  });

  describe("#has", () => {
    it("returns true with an item that is in the collection", () => {
      expect(get("collection").has(7)).to.be.true;
    });

    it("returns false with an item that is not in the collection", () => {
      expect(get("collection").has(9)).to.be.false;
    });
  });
});

describe("Set", () => {
  subject(() => new Set([7]));

  itBehavesLike("a collection", get.variable("subject"));
});

describe("Map", () => {
  subject(() => new Map([[2, 1]]));

  itBehavesLike("a collection", get.variable("subject"));
});
```

</details>

## Shortcuts

Very often we want to declare several test cases which tests subject's field or subject's behavior.
To do this quickly you can use `its` or `it` without message:

<details>
  <summary>Shortcuts example</summary>

```js
describe("Array", () => {
  subject(() => ({
    items: [1, 2, 3],
    name: "John",
  }));

  its("items.length", () => is.expected.to.equal(3)); // i.e. expect(get('subject').items.length).to.equal(3)
  its("name", () => is.expected.to.equal("John")); // i.e. expect(get('subject').name).to.equal('John')

  // i.e. expect(get('subject')).to.have.property('items').which.has.length(3)
  it(() => is.expected.to.have.property("items").which.has.length(3));
});
```

Also it generates messages for you based on passed in function body. The example above reports:

```sh
  Array
    ✓ is expected to have property('items') which has length(3)
    items.length
      ✓ is expected to equal(3)
    name
      ✓ is expected to equal('John')
```

</details>

**Note**: if you use `mocha` and `chai` make sure that defines `global.expect = chai.expect`, otherwise `is.expected` will throw error that `context.expect` is `undefined`.

## Installation

```bash
npm install bdd-lazy-var-next --save-dev
```

## Setup & Configuration

**Important**: Unlike the original `bdd-lazy-var`, this library requires you to import the specific entry point for your testing framework. There is no "auto-detection" entry point.

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

## Migration from `bdd-lazy-var`

If you are migrating from the original library, here are the key changes:

1.  **Updated Imports**: You must change your imports from `bdd-lazy-var` to `bdd-lazy-var-next/<framework>`.
    - Old: `import { get } from 'bdd-lazy-var';`
    - New: `import { get } from 'bdd-lazy-var-next/bun';` (or `vitest`, `jest`, etc.)
2.  **No Auto-Detection**: The library no longer tries to guess which test framework you are using. You must explicitly choose the correct entry point.
3.  **Native ESM**: The library is built as native ESM modules, which works better with modern tools like Bun and Vitest.

## The Core Features

- lazy instantiation, allows variable composition
- automatically cleaned after each test
- accessible inside `before/beforeAll`, `after/afterAll` callbacks
- named `subject`s to be more explicit
- ability to shadow parent's variable
- variable inheritance with access to parent variables
- supports typescript

For more information, read [the article on Medium](https://medium.com/@sergiy.stotskiy/lazy-variables-with-mocha-js-d6063503104c#.ceo9jvrzh).

## TypeScript Notes

It's also possible to use `bdd-lazy-var-next` with TypeScript.

<details>
  <summary>tsconfig.json</summary>

```js
{
  "compilerOptions": {
    // ...
  },
  "include": [
    "src/**/*",
    "node_modules/bdd-lazy-var-next/index.d.ts"
  ]
}
```

</details>

<details>
  <summary>ES6 module system</summary>

```js
import { get, def } from "bdd-lazy-var-next/bun"; // or your framework

describe("My Test", () => {
  // ....
});
```

In this case TypeScript loads corresponding declarations automatically

</details>

## Examples

<details>
  <summary>Test with subject</summary>

```js
describe("Array", () => {
  subject(() => [1, 2, 3]);

  it("has 3 elements by default", () => {
    expect(get("subject")).to.have.length(3);
  });
});
```

</details>

<details>
  <summary>Named subject</summary>

```js
describe("Array", () => {
  subject("collection", () => [1, 2, 3]);

  it("has 3 elements by default", () => {
    expect(get("subject")).to.equal(get("collection"));
    expect(get("collection")).to.have.length(3);
  });
});
```

</details>

<details>
  <summary>`beforeEach` and redefined subject</summary>

```js
describe("Array", () => {
  subject("collection", () => [1, 2, 3]);

  beforeEach(() => {
    // this beforeEach is executed for tests of suite with subject equal [1, 2, 3]
    // and for nested describe with subject being []
    get("subject").push(4);
  });

  it("has 3 elements by default", () => {
    expect(get("subject")).to.equal(get("collection"));
    expect(get("collection")).to.have.length(3);
  });

  describe("when empty", () => {
    subject(() => []);

    it("has 1 element", () => {
      expect(get("subject")).not.to.equal(get("collection"));
      expect(get("collection")).to.deep.equal([4]);
    });
  });
});
```

</details>

<details>
  <summary>Access parent variable in child variable definition</summary>

```js
describe("Array", () => {
  subject("collection", () => [1, 2, 3]);

  it("has 3 elements by default", () => {
    expect(get("subject")).to.equal(get("collection"));
    expect(get("collection")).to.have.length(3);
  });

  describe("when empty", () => {
    subject(() => {
      // in this definition `get('subject')` references parent subject (i.e., `get('collection')` variable)
      return get("subject").concat([4, 5]);
    });

    it("is properly uses parent subject", () => {
      expect(get("subject")).not.to.equal(get("collection"));
      expect(get("collection")).to.deep.equal([1, 2, 3, 4, 5]);
    });
  });
});
```

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
