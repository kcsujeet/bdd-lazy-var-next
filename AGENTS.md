# BDD Lazy Var Next - AI Agent Instructions

## Project Overview

This is **bdd-lazy-var-next**, a testing DSL library that adds RSpec-style lazy variable definitions to JavaScript testing frameworks (Mocha, Jasmine, Jest, Vitest, Bun). It provides three dialects for accessing lazy variables: `$varName` (global), `get.varName` (getter), and `get('varName')` (function).

**Note**: This is a community-maintained fork of the original bdd-lazy-var project with added support for Vitest and Bun test frameworks.

**Core Architecture Pattern**: The library uses a metadata-tracking system with suite lifecycle hooks to manage lazy variable evaluation and cleanup across test hierarchies.

## Key Architectural Components

### 1. Variable Evaluation System (`lib/variable.js` & `lib/metadata.js`)

- **Lazy evaluation**: Variables are only instantiated when accessed, not when defined
- **Variable stack**: Tracks currently-evaluating variables to enable parent context access via `$subject` within child definitions
- **Metadata tree**: Each suite has a `Metadata` instance that inherits from parent suite metadata via prototype chain (`Object.create(this.defs)`)
- **Variable shadowing**: Child suites can redefine parent variables; accessing `$varName` in a child definition retrieves the parent's value

**Example pattern from codebase**:

```javascript
// Parent suite defines subject
subject(() => [1, 2, 3]);

// Child suite can access parent subject within its own definition
describe("nested", () => {
  subject(() => $subject.concat([4, 5])); // $subject references parent value
});
```

### 2. Framework Integration (`lib/interface/`)

- Auto-detects testing framework: checks for `jest` global → `jasmine` global → `Bun.jest` → `vitest` → `mocha` module
- Each framework adapter (`mocha.js`, `jasmine.js`, `jest.js`, `vitest.js`, `bun.js`) wraps suite/test functions to track lifecycle
- **Suite tracking** (`lib/suite_tracker.js`): Wraps `describe` to maintain current context and register cleanup hooks
- Mocha uses `on('pre-require')` events; Jasmine/Jest/Vitest/Bun use direct monkey-patching

### 3. Dialects & Build System

Three UMD bundles built via Rollup (`tools/rollup.umd.js`):

- `index.js`: `get('varName')` syntax
- `global.js`: `$varName` syntax (uses `defineGetter` to create global properties)
- `getter.js`: `get.varName` syntax (uses Proxy)

**Build workflow**: `npm run build` → compiles `lib/interface/dialects/bdd_*.js` → transpiles with Babel → creates UMD with optional peer deps

## Development Workflows

### Running Tests

Tests validate all 3 dialects × 5 frameworks × 2 environments (node + browser where applicable):

```bash
# Node tests
npm run test.mocha      # All 3 Mocha dialects
npm run test.jasmine    # All 3 Jasmine dialects
npm run test.jest       # All 3 Jest dialects
npm run test.vitest     # All 3 Vitest dialects
npm run test.bun        # All 3 Bun dialects

# Browser tests (via Karma)
npm run test.mocha-in-browser
npm run test.jasmine-in-browser

# Full suite
npm test  # Runs all combinations
```

**Test organization**: `spec/interface_examples.js` defines shared behaviors using `sharedExamplesFor()`, included by `spec/interface_spec.js`, `spec/global_defs_spec.js`, and `spec/getter_defs_spec.js`.

### Code Conventions

- **Airbnb style** with exceptions in `.eslintrc` (no-plusplus off, comma-dangle off, etc.)
- Use `Symbol.for()` for private property keys (see `lib/symbol.js`)
- No ES6 classes except `Variable` and `Metadata` classes
- Factory functions return object literals with closures over dependencies

### Adding Features

1. **Add to core interface** (`lib/interface.js`) - implements framework-agnostic logic
2. **Update framework adapters** if lifecycle hooks needed (e.g., `lib/interface/mocha.js`)
3. **Add TypeScript definitions** to `interface.d.ts` (and `getter.d.ts` for getter dialect)
4. **Test with shared examples** in `spec/interface_examples.js` to validate across all frameworks

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
  it("has correct size", () => expect($subject.size).to.equal(size));
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
//   def('__itsSubject__', () => $subject.items.length)
//   it('is expected to equal(3)', ...)
// })
```

Uses `parseMessage()` to auto-generate test names from assertion code.

## Common Pitfalls

1. **Variable cleanup**: Must call `metadata.releaseVars()` in `afterEach` or memory leaks occur
2. **Context tracking**: `tracker.currentContext` must update before/after each suite to maintain correct variable scope
3. **Circular dependencies**: Accessing `$varName` within its own definition throws; use parent reference pattern instead
4. **Framework detection**: Library must load AFTER test framework for auto-detection to work

## TypeScript Support

- **Best dialects**: `get()` and `getter` (auto-complete works)
- **Global dialect limitation**: Requires manual `declare let $varName: Type` for each variable (dynamic getters can't be typed)
- Include path in `tsconfig.json`: `"node_modules/bdd-lazy-var/getter.d.ts"`

## Release Process

Uses semantic-release with Angular commit conventions:

- `npm run lint` → `npm run build` (prebuild hook)
- `npm run release` triggers CI-based semantic-release
- Commit types: `feat`, `fix`, `chore(deps)`, `docs(README)` trigger patch releases
