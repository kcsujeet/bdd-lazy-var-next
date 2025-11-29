const JasmineCli = require('jasmine');

const jasmine = new JasmineCli();
const helpers = [
  '../../../src/test/config',
  `../../../${process.argv[2]}`,
  '../../../src/test/interface_examples',
  '../../../src/test/default_suite_tracking_examples'
];

helpers.forEach(require);
jasmine.loadConfig({
  spec_dir: 'src/dialects',
  spec_files: [
    process.argv[3]
  ],
});

jasmine.execute();
