// eslint-disable-next-line
const interfaceBuilder = require("../index");
// eslint-disable-next-line
const { defineGetter } = require("../core/define_var");

const ui = (interfaceBuilder.default || interfaceBuilder).createUi(
  "bdd-lazy-var-next/global",
  {
    onDefineVariable(suite: any, varName: string, context: any) {
      defineGetter(context, varName, { getterPrefix: "$" });
    },
  }
);

// eslint-disable-next-line
module.exports = ui;
