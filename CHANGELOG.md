# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Note**: This is a community-maintained fork of the original [bdd-lazy-var](https://github.com/stalniy/bdd-lazy-var) with added support for Vitest and Bun test frameworks.

## [Unreleased]

### Fixed

- Build system: Disabled minification to prevent variable name mangling issues
- Build system: Improved `makeOptionalRequires` to handle CJS-style module imports
- Updated test scripts to use correct file extensions (.cjs, .mjs) for different frameworks
- Fixed Jest ESM native usage tests to import from `.mjs` files
- Fixed duplicate `requireModule` declaration in bundled output

## [0.0.4] - 2024-12-04

### Added

- React example with Jest consumer
- Enhanced Jest configuration for better ESM compatibility

### Changed

- Improved build process for better framework compatibility

## [0.0.3] - 2024-12-03

### Added

- Mock function tests for Vitest consumer
- Documentation warning notes recommending migration from Jest, Mocha, and Jasmine to Vitest and Bun

### Changed

- Fixed type exports and enhanced examples
- Improved TypeScript support

## [0.0.2] - 2024-12-02

### Changed

- Improved TypeScript support
- Updated note formatting and warning style in README
- Added examples for Bun and Vitest consumers in README

### Added

- Bun and Vitest consumer examples with basic tests and configuration

## [0.0.1] - 2024-12-01

Initial fork from [bdd-lazy-var v2.6.1](https://github.com/stalniy/bdd-lazy-var) with significant modernization and breaking changes.

### Added

- **BREAKING**: Vitest support
- **BREAKING**: Bun test framework support
- Native ESM build system using Bun bundler
- TypeScript migration of entire codebase
- Explicit framework entry points (must import from `bdd-lazy-var-next/bun`, etc.)
- Biome for linting and formatting (replacing ESLint)
- Native usage tests for all frameworks
- Type checking in CI pipeline

### Changed

- **BREAKING**: Removed auto-detection of test frameworks - must use explicit imports
- **BREAKING**: Removed `its` shortcut and `is.expected` helper
- **BREAKING**: Removed support for `global` and `getter` patterns
- **BREAKING**: Published as native ESM only
- Migrated from Rollup to Bun bundler
- Standardized test suite structure
- Updated to bullet-proof React project structure

### Removed

- **BREAKING**: Generic `bdd-lazy-var` import (must use framework-specific imports)
- **BREAKING**: `its` and `is` dialect support
- Legacy JavaScript source files

[Unreleased]: https://github.com/kcsujeet/bdd-lazy-var-next/compare/v0.0.4...HEAD
[0.0.4]: https://github.com/kcsujeet/bdd-lazy-var-next/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/kcsujeet/bdd-lazy-var-next/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/kcsujeet/bdd-lazy-var-next/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/kcsujeet/bdd-lazy-var-next/releases/tag/v0.0.1
