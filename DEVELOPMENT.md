# Development Guide

## Prerequisites

- [Bun](https://bun.sh/) (for building and package management)
- Node.js 20+ (for running tests with various frameworks)
- Git

## Setup

1. Clone the repository:

```bash
git clone https://github.com/kcsujeet/bdd-lazy-var-next.git
cd bdd-lazy-var-next
```

2. Install dependencies:

```bash
bun install
```

3. Build the project:

```bash
bun run build
```

This will generate the UMD bundles in the `dist/` folder:

- `dist/index.js` - Function dialect: `get('varName')`
- `dist/global.js` - Global dialect: `$varName`
- `dist/getter.js` - Getter dialect: `get.varName`

## Development Workflow

### Linting

Run ESLint to check for code style issues:

```bash
bun run lint:check
```

Auto-fix linting issues:

```bash
bun run lint
```

### Building

Build all three dialects:

```bash
bun run build
```

The build process:

1. Runs linting (`prebuild` hook)
2. Uses Bun's bundler to create UMD bundles
3. Wraps optional dependencies (mocha, jasmine) with try-catch
4. Generates sourcemaps

### Testing

Run tests for specific frameworks:

```bash
bun run test.mocha      # Mocha tests
bun run test.jasmine    # Jasmine tests
bun run test.jest       # Jest tests
bun run test.vitest     # Vitest tests
bun run test.bun        # Bun test framework
```

Run all tests:

```bash
bun run test
```

## Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) for pre-commit hooks.

### Pre-commit Hook

Before each commit, lint-staged will:

- Run ESLint on staged JavaScript files in `src/`
- Auto-fix linting issues where possible
- Abort commit if there are unfixable linting errors

To bypass the hook (not recommended):

```bash
git commit --no-verify
```

## Continuous Integration

GitHub Actions workflows are configured in `.github/workflows/ci.yml`.

### CI Jobs

1. **lint-and-build**: Runs linting and build, uploads build artifacts
2. **test-mocha**: Tests with Mocha framework
3. **test-jasmine**: Tests with Jasmine framework
4. **test-vitest**: Tests with Vitest framework
5. **test-bun**: Tests with Bun test framework

### Running CI Locally

To run the same checks that CI runs:

```bash
bun run ci
```

This will:

1. Run `lint:check` (ESLint without auto-fix)
2. Run `build` (generate bundles)

## Project Structure

```
bdd-lazy-var-next/
├── src/                          # Source code
│   ├── interface/               # Framework adapters
│   │   ├── mocha.js            # Mocha adapter
│   │   ├── jasmine.js          # Jasmine adapter
│   │   ├── jest.js             # Jest adapter
│   │   ├── vitest.js           # Vitest adapter
│   │   ├── bun.js              # Bun test adapter
│   │   └── dialects/           # Different access patterns
│   │       ├── bdd.js          # Function dialect
│   │       ├── bdd_global_var.js  # Global dialect
│   │       └── bdd_getter_var.js  # Getter dialect
│   ├── metadata.js             # Variable metadata management
│   ├── suite_tracker.js        # Test suite tracking
│   └── variable.js             # Lazy variable implementation
├── spec/                        # Test files
├── tools/                       # Build and test utilities
│   └── build.js                # Bun-based build script
├── dist/                        # Generated bundles (gitignored)
├── .husky/                      # Git hooks
└── .github/workflows/          # CI configuration
```

## Release Process

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated releases.

### Commit Message Format

Follow the [Angular Commit Message Conventions](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format):

- `feat:` - New feature (triggers minor version bump)
- `fix:` - Bug fix (triggers patch version bump)
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `chore(deps):` - Dependency updates (triggers patch version bump)

Breaking changes should include `BREAKING CHANGE:` in the commit body (triggers major version bump).

### Publishing

Releases are automated via GitHub Actions when changes are pushed to `master`:

```bash
git push origin master
```

semantic-release will:

1. Analyze commits to determine version bump
2. Generate changelog
3. Create a git tag
4. Publish to npm
5. Create a GitHub release

## Troubleshooting

### Build Issues

If you encounter build errors:

1. Ensure you're using the latest Bun version: `bun upgrade`
2. Clear node_modules and reinstall: `rm -rf node_modules bun.lock && bun install`
3. Check that all peer dependencies are satisfied

### Test Failures

- Make sure to build before testing: `bun run build`
- Some tests require specific frameworks to be installed
- Browser tests (Karma) require additional setup

### Lint-staged Issues

If pre-commit hooks aren't running:

```bash
bunx husky install
```

If you need to update the lint-staged configuration, edit the `lint-staged` section in `package.json`.
