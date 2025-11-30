const uiFile = process.env.SRC_FILE;

await import("../../test/config.ts");
await import(`../../../${uiFile}`);
await import("../../test/interface_examples.ts");
await import("../../test/default_suite_tracking_examples.ts");
await import("../../test/shared_behavior.spec.ts");

export {};
