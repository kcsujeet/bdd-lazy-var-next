import "../../test/config";

const uiFile = process.env.SRC_FILE;
// eslint-disable-next-line @typescript-eslint/no-var-requires
require(`../../../${uiFile}`);

await import("../../test/interface_examples");
await import("../../test/default_suite_tracking_examples");
await import("../../test/shared_behavior.spec");
