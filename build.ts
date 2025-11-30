#!/usr/bin/env bun
/* eslint-disable no-console */
/* global Bun */
/**
 * Build script using Bun's native bundler
 * Replaces Rollup for building UMD bundles for bdd-lazy-var-next
 */

const MODULE_NAME = "bdd_lazy_var";

// External dependencies that should not be bundled
const external = ["mocha", "jasmine", "jest", "vitest"];

// UMD wrapper
const createUMDWrapper = (code: string) => {
  const optionalHelper =
    "function optional(name) { try { return require(name); } catch(e) {} }";

  return `(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define([], factory) :
  factory();
}(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, (function () {
  'use strict';
  ${optionalHelper}
  ${code}
})));`;
};

// Replace require calls with optional() for framework dependencies
function makeOptionalRequires(code: string) {
  let result = code;

  // Replace require calls for mocha and jasmine
  result = result.replace(/require\(["']mocha["']\)/g, 'optional("mocha")');
  result = result.replace(/require\(["']jasmine["']\)/g, 'optional("jasmine")');

  return result;
}

async function buildBundle(entrypoint: string, outputFile: string) {
  console.log(`Building ${outputFile}...`);

  try {
    const result = await Bun.build({
      entrypoints: [entrypoint],
      target: "node",
      format: "cjs",
      minify: false,
      sourcemap: "external",
      external,
    });

    if (!result.success) {
      console.error(`Build failed for ${outputFile}:`);
      result.logs.forEach((log) => console.error(log));
      process.exit(1);
    }

    // Get the generated output
    let code = await result.outputs[0].text();

    // Remove the Bun pragma if present
    code = code.replace(/^\/\/ @bun.*\n/gm, "");

    // Replace global.jasmine with globalThis.jasmine for browser compatibility
    code = code.replace(/global\.jasmine/g, "globalThis.jasmine");

    // Make framework requires optional
    code = makeOptionalRequires(code);

    // Wrap in UMD format
    const umdCode = createUMDWrapper(code);

    // Write to output file
    await Bun.write(outputFile, umdCode);

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

async function main() {
  console.log("Building bdd-lazy-var-next with Bun bundler...\n");

  // Ensure dist directory exists
  await Bun.write("dist/.gitkeep", "");

  // Build all three dialects
  await buildBundle("./src/dialects/bdd.ts", "./dist/index.js");
  await buildBundle("./src/dialects/bdd_global_var.ts", "./dist/global.js");
  await buildBundle("./src/dialects/bdd_getter_var.ts", "./dist/getter.js");

  console.log("\n✓ All builds completed successfully!");
}

main().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
