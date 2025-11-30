const uiFile = process.env.SRC_FILE;

require("../../test/config.ts");

// eslint-disable-next-line @typescript-eslint/no-var-requires
require(`../../../${uiFile}`);
require("../../test/interface_examples.ts");
require("../../test/default_suite_tracking_examples.ts");
require("../../test/shared_behavior.spec.ts");
