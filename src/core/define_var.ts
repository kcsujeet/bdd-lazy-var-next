import Symbol from '../utils/symbol';

const LAZY_VARS_PROP_NAME = Symbol.for('__lazyVars');

export interface DefineGetterOptions {
  getterPrefix?: string;
  defineOn?: any;
}

export function defineGetter(
  context: any,
  varName: string,
  options: DefineGetterOptions = {}
) {
  const params = {
    getterPrefix: '',
    defineOn: context,
    ...options,
  };

  const accessorName = params.getterPrefix + varName;
  const varContext = params.defineOn;
  const vars = (varContext[LAZY_VARS_PROP_NAME] = varContext[LAZY_VARS_PROP_NAME] || {});

  if (accessorName in vars) {
    return;
  }

  if (accessorName in varContext) {
    throw new Error(
      `Cannot create lazy variable "${varName}" as variable with the same name exists on the provided context`
    );
  }

  vars[accessorName] = true;
  Object.defineProperty(varContext, accessorName, {
    configurable: true,
    get: () => context.get(varName),
  });
}
