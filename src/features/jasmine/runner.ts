import { createRequire } from "node:module";
import JasmineCli from "jasmine";

const requireModule = createRequire(import.meta.url);

const jasmine = new JasmineCli();
const helpers = [
	"../../../src/test/config",
	`../../../${process.argv[2]}`,
	"../../../src/test/interface_examples",
	"../../../src/test/default_suite_tracking_examples",
];

helpers.forEach(requireModule);
jasmine.loadConfig({
	spec_dir: ".",
	spec_files: [process.argv[3]],
});

jasmine.execute();
