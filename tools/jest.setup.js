
const uiFile = process.env.SRC_FILE;

console.log('Is describe defined?', typeof global.describe);
console.log('Is xdescribe defined?', typeof global.xdescribe);
console.log('Is fdescribe defined?', typeof global.fdescribe);

require('../spec/config');
require(`../${uiFile}`);
require('../spec/interface_examples');
require('../spec/default_suite_tracking_examples');
require('../spec/shared_behavior_spec');
