import { defineGetter } from "../core/define_var";
import interfaceBuilder from "../index";

const ui = (interfaceBuilder as any).createUi("bdd-lazy-var-next/getter", {
	onDefineVariable(suite: any, varName: string, context: any) {
		defineGetter(context, varName, { defineOn: context.get });
	},
});

export default ui;
