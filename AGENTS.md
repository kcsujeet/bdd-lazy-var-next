# BDD Lazy Var Next - AI Agent Instructions

## Critical Instruction: Use Bun

**ALWAYS use `bun` instead of `npm` for running scripts and installing packages.**

- Run scripts: `bun run <script-name>` (e.g., `bun run test`, `bun run build`)
- Install packages: `bun install`
- Run tests: `bun test` (or via scripts like `bun run test.bun`)

## Critical Instruction: Verify Before Commit

**ALWAYS run `bun run ci` and ensure it passes before committing any changes.**

- This script runs linting, type checking, building, and all test suites (including native usage tests).
- If this script fails, DO NOT commit. Fix the issues first.

## Project Overview

This is **bdd-lazy-var-next**, a testing DSL library that adds RSpec-style lazy variable definitions to JavaScript testing frameworks (Mocha, Jasmine, Jest, Vitest, Bun). It provides a dialect for accessing lazy variables: `get('varName')` (function).

**Note**: This is a community-maintained fork of the original bdd-lazy-var project with added support for Vitest and Bun test frameworks.

**Core Architecture Pattern**: The library uses a metadata-tracking system with suite lifecycle hooks to manage lazy variable evaluation and cleanup across test hierarchies.

## Key Architectural Components

### 1. Variable Evaluation System (`src/core/variable.js` & `src/core/metadata.js`)

- **Lazy evaluation**: Variables are only instantiated when accessed, not when defined
- **Variable stack**: Tracks currently-evaluating variables to enable parent context access via `get('subject')` within child definitions
- **Metadata tree**: Each suite has a `Metadata` instance that inherits from parent suite metadata via prototype chain (`Object.create(this.defs)`)
- **Variable shadowing**: Child suites can redefine parent variables; accessing `get('varName')` in a child definition retrieves the parent's value

**Example pattern from codebase**:

```javascript
// Parent suite defines subject
subject(() => [1, 2, 3]);

// Child suite can access parent subject within its own definition
describe("nested", () => {
  subject(() => get("subject").concat([4, 5])); // get('subject') references parent value
});
```

### 2. Framework Integration (`src/features/`)

- Auto-detects testing framework: checks for `jest` global → `jasmine` global → `Bun.jest` → `vitest` → `mocha` module
- Each framework adapter (`mocha.js`, `jasmine.js`, `jest.js`, `vitest.js`, `bun.js`) wraps suite/test functions to track lifecycle
- **Suite tracking** (`src/core/suite_tracker.js`): Wraps `describe` to maintain current context and register cleanup hooks
- Mocha uses `on('pre-require')` events; Jasmine/Jest/Vitest/Bun use direct monkey-patching

### 3. Dialects & Build System

One UMD bundle built via Bun (`tools/build.js`):

- `index.js`: `get('varName')` syntax

**Build workflow**: `bun run build` → compiles `src/dialects/bdd.ts` → transpiles with Babel → creates UMD with optional peer deps

## Development Workflows

### Running Tests

Tests validate the library across 5 frameworks × 2 environments (node + browser where applicable):

```bash
# Node tests
npm run test.mocha      # Mocha tests
npm run test.jasmine    # Jasmine tests
npm run test.jest       # Jest tests
npm run test.vitest     # Vitest tests
npm run test.bun        # Bun tests

# Browser tests (via Karma)
npm run test.mocha-in-browser
npm run test.jasmine-in-browser

# Full suite
npm test  # Runs all combinations
```

**Test organization**: `src/test/interface_examples.ts` defines shared behaviors using `sharedExamplesFor()`, included by `src/test/interface_spec.ts`.

### Code Conventions

- **Airbnb style** with exceptions in `.eslintrc` (no-plusplus off, comma-dangle off, etc.)
- Use `Symbol.for()` for private property keys (see `src/utils/symbol.js`)
- No ES6 classes except `Variable` and `Metadata` classes
- Factory functions return object literals with closures over dependencies

### Adding Features

1. **Add to core interface** (`src/core/interface.js`) - implements framework-agnostic logic
2. **Update framework adapters** if lifecycle hooks needed (e.g., `src/features/mocha/index.js`)
3. **Add TypeScript definitions** to `index.d.ts`
4. **Test with shared examples** in `src/test/interface_examples.ts` to validate across all frameworks

## Critical Patterns

### Variable Definition Registration

```javascript
def("varName", () => value); // Registers in current suite's metadata
subject("name", () => value); // Creates both 'name' and 'subject' aliases
```

**Implementation**: `Metadata.addVar()` stores definition, `defineGetter()` creates accessor on context object

### Shared Examples (RSpec-style)

```javascript
sharedExamplesFor("a collection", (size) => {
  it("has correct size", () => expect(get("subject").size).to.equal(size));
});

itBehavesLike("a collection", 3); // Wraps in describe() + includeExamplesFor()
includeExamplesFor("a collection", 3); // Executes inline
```

Stored with `EXAMPLES_PREFIX` in metadata to avoid namespace collisions.

### The `its()` Helper

Generates nested describes for property testing:

```javascript
its("items.length", () => is.expected.to.equal(3));
// Equivalent to:
// describe('items.length', () => {
//   def('__itsSubject__', () => get('subject').items.length)
//   it('is expected to equal(3)', ...)
// })
```

Uses `parseMessage()` to auto-generate test names from assertion code.

## Common Pitfalls

1. **Variable cleanup**: Must call `metadata.releaseVars()` in `afterEach` or memory leaks occur
2. **Context tracking**: `tracker.currentContext` must update before/after each suite to maintain correct variable scope
3. **Circular dependencies**: Accessing `get('varName')` within its own definition throws; use parent reference pattern instead
4. **Framework detection**: Library must load AFTER test framework for auto-detection to work

## TypeScript Support

- **Best dialect**: `get()` (auto-complete works)
- Include path in `tsconfig.json`: `"node_modules/bdd-lazy-var/index.d.ts"`

## Release Process

Uses semantic-release with Angular commit conventions:

- `npm run lint` → `npm run build` (prebuild hook)
- `npm run release` triggers CI-based semantic-release
- Commit types: `feat`, `fix`, `chore(deps)`, `docs(README)` trigger patch releases
