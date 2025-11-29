const interfaceBuilder = require('../index');
const defineGetterOnce = require('../core/define_var');

module.exports = interfaceBuilder.createUi('bdd-lazy-var-next/global', {
  onDefineVariable(suite, varName, context) {
    defineGetterOnce(context, varName, { getterPrefix: '$' });
  }
});
