const interfaceBuilder = require('../index');
const defineGetterOnce = require('../core/define_var');

module.exports = interfaceBuilder.createUi('bdd-lazy-var-next/getter', {
  onDefineVariable(suite, varName, context) {
    defineGetterOnce(context, varName, { defineOn: context.get });
  }
});
