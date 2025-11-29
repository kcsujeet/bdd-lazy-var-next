const uiFile = process.env.SRC_FILE;

require('../../test/config');

require(`../../../${uiFile}`); // eslint-disable-line import/no-dynamic-require
require('../../test/interface_examples');
require('../../test/default_suite_tracking_examples');
require('../../test/shared_behavior.spec');
