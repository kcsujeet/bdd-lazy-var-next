const uiFile = process.env.SRC_FILE;

require('../../test/config.ts');

require(`../../../${uiFile}`); // eslint-disable-line import/no-dynamic-require
require('../../test/interface_examples.ts');
require('../../test/default_suite_tracking_examples.ts');
require('../../test/shared_behavior.spec.ts');
