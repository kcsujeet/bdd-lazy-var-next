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

  // Remove usages for all collected names
  names.forEach((name) => {
    const usageRegex = new RegExp(
      `(?:var|const|let)\\s+\\w+\\s*=\\s*${name}\\(import\\.meta\\.url\\);?`,
      "g"
    );
    result = result.replace(usageRegex, "");
  });

  // Inject dummy require for browser compatibility
  const dummyRequire = "const require = () => undefined;";
  result = `${dummyRequire}\n${result}`;

  return result;
}

async function buildBundle(entrypoint: string, outputFile: string) {
  console.log(`Building ${outputFile}...`);

  try {
    const result = await Bun.build({
      entrypoints: [entrypoint],
      target: "node",
      format: "esm",
      minify: false,
      sourcemap: "external",
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

async function main() {
  console.log("Building bdd-lazy-var-next with Bun bundler (ESM)...\n");

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
