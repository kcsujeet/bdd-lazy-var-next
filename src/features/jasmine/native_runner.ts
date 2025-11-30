import { createRequire } from "node:module";
import JasmineCli from "jasmine";

const requireModule = createRequire(import.meta.url);

const jasmine = new JasmineCli();
// Only load the library, not the test config/helpers which inject Chai
const helpers = [`../../../${process.argv[2]}`];

helpers.forEach(requireModule);
jasmine.loadConfig({
	spec_dir: ".",
	spec_files: [process.argv[3]],
});

jasmine.execute();
