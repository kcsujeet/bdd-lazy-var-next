#!/usr/bin/env bun
/* eslint-disable no-console */
/* global Bun */
/**
 * Build script using Bun's native bundler
 * Replaces Rollup for building ESM bundles for bdd-lazy-var-next
 */

// Replace require calls with optional() for framework dependencies
function makeOptionalRequires(code: string) {
  let result = code;

  // Remove createRequire imports and usage
  // Matches: import { createRequire as ... } from "module"; OR import { createRequire } from "module";
  const importRegex =
    /import\s*{\s*createRequire(?:\s+as\s+(\w+))?\s*}\s*from\s*["'](?:node:)?module["'];?/g;

  const names = new Set<string>();
  names.add("createRequire"); // Default name if no alias

  result = result.replace(importRegex, (match, alias) => {
    if (alias) names.add(alias);
    return ""; // Remove the import
  });


  // Remove usages for all collected names and also namespace.createRequire patterns
  names.forEach((name) => {
    // Match both import.meta.url and resolved file paths like "file://..."
    const usageRegex = new RegExp(
      `(?:var|const|let)\\s+\\w+\\s*=\\s*(?:\\w+\\.)?${name}\\([^)]+\\);?`,
      "g"
    );
    result = result.replace(usageRegex, "");
  });

  // Inject dummy require for browser compatibility
  // Use requireModule to avoid conflict with global require in some environments (like Jest)
  const dummyRequire =
    "const requireModule = (typeof require !== 'undefined' ? require : () => undefined);";
  result = `${dummyRequire}\n${result}`;

  return result;
}

async function buildBundle(
  entrypoint: string,
  outputFile: string,
  format: "esm" | "cjs" = "esm"
) {
  console.log(`Building ${outputFile} (${format})...`);

  try {
    const result = await Bun.build({
      entrypoints: [entrypoint],
      target: "node",
      format,
      minify: false,
      sourcemap: "external",
    });

    if (!result.success) {
      console.error(`Build failed for ${outputFile}:`);
      result.logs.forEach((log) => {
        console.error(log);
      });
      process.exit(1);
    }

    // Get the generated output
    let code = await result.outputs[0].text();

    // Remove the Bun pragma if present
    code = code.replace(/^\/\/ @bun.*\n/gm, "");

    // Replace global.jasmine with globalThis.jasmine for browser compatibility
    code = code.replace(/global\.jasmine/g, "globalThis.jasmine");

    // Make framework requires optional and strip createRequire
    code = makeOptionalRequires(code);

    // Write to output file
    await Bun.write(outputFile, code);

    // Copy sourcemap if it exists
    if (result.outputs[0].sourcemap) {
      const sourcemapContent = await result.outputs[0].sourcemap.text();
      await Bun.write(`${outputFile}.map`, sourcemapContent);
    }

    console.log(`✓ Built ${outputFile}`);
  } catch (error) {
    console.error(`Error building ${outputFile}:`, error);
    process.exit(1);
  }
}

async function generateEntryPointTypes() {
  console.log("Generating entry point type definitions...");

  const entryPoints = ["bun", "vitest", "jest", "jasmine", "mocha"];

  // Read the main index.d.ts content
  const indexTypes = await Bun.file("index.d.ts").text();

  const typeDefinition = `${indexTypes}

declare global {
  const get: GetVar;
  function def<T = any>(name: string | string[], implementation: () => T): void;
  function subject<T = any>(name: string, implementation: () => T): void;
  function subject<T = any>(implementation: () => T): void;
  function subject<T = any>(): T;
  function sharedExamplesFor(name: string, implementation: (...args: any[]) => void): void;
  function includeExamplesFor(name: string, ...args: any[]): void;
  function itBehavesLike(name: string, ...args: any[]): void;
}
`;

  for (const entry of entryPoints) {
    await Bun.write(`dist/${entry}.d.ts`, typeDefinition);
  }

  console.log("✓ Generated entry point type definitions");
}

async function main() {
  console.log("Building bdd-lazy-var-next with Bun bundler...\n");

  // Ensure dist directory exists
  await Bun.write("dist/.gitkeep", "");

  // Build specific runners directly from features
  // ESM for modern test runners (Bun, Vitest)
  await buildBundle("./src/features/bun/index.ts", "./dist/bun.js", "esm");
  await buildBundle(
    "./src/features/vitest/index.ts",
    "./dist/vitest.js",
    "esm"
  );

  // Build both ESM and CJS for traditional test runners (Jest, Jasmine, Mocha)
  // CJS is the default format in package.json exports
  await buildBundle("./src/features/jest/index.ts", "./dist/jest.cjs", "cjs");
  await buildBundle("./src/features/jest/index.ts", "./dist/jest.mjs", "esm");

  await buildBundle(
    "./src/features/jasmine/index.ts",
    "./dist/jasmine.cjs",
    "cjs"
  );
  await buildBundle(
    "./src/features/jasmine/index.ts",
    "./dist/jasmine.mjs",
    "esm"
  );

  await buildBundle("./src/features/mocha/index.ts", "./dist/mocha.cjs", "cjs");
  await buildBundle("./src/features/mocha/index.ts", "./dist/mocha.mjs", "esm");

  // Generate type definitions for each entry point
  await generateEntryPointTypes();

  console.log("\n✓ Build completed successfully!");
}
main().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
