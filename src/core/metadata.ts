import Symbol from '../utils/symbol';

const LAZY_VARS_FIELD = Symbol.for('__lazyVars');
const EXAMPLES_PREFIX = '__SH_EX:';

export class VariableMetadata {
  value: any;

  parent: Metadata;

  names: Record<string, boolean>;

  constructor(name: string, definition: any, metadata: Metadata) {
    this.value = definition;
    this.parent = metadata;
    this.names = { [name]: true };
  }

  addName(name: string) {
    this.names[name] = true;
    return this;
  }

  isNamedAs(name: string) {
    return this.names[name];
  }

  evaluate() {
    return typeof this.value === 'function' ? this.value() : this.value;
  }
}

export class Metadata {
  static of(context: any, varName?: string) {
    const metadata = context[LAZY_VARS_FIELD];

    return varName && metadata ? metadata.defs[varName] : metadata;
  }

  static ensureDefinedOn(context: any) {
    if (!Object.prototype.hasOwnProperty.call(context, LAZY_VARS_FIELD)) {
      context[LAZY_VARS_FIELD] = new Metadata();
    }

    return context[LAZY_VARS_FIELD];
  }

  defs: Record<string, VariableMetadata>;

  values: Record<string, any>;

  hasValues: boolean;

  defined: boolean;

  parent?: Metadata;

  constructor() {
    this.defs = {};
    this.values = {};
    this.hasValues = false;
    this.defined = false;
  }

  getVar(name: string) {
    if (
      !Object.prototype.hasOwnProperty.call(this.values, name)
      && this.defs[name]
    ) {
      this.hasValues = true;
      this.values[name] = this.evaluate(name);
    }

    return this.values[name];
  }

  evaluate(name: string) {
    return this.defs[name].evaluate();
  }

  addChild(child: Metadata) {
    child.defs = Object.assign(Object.create(this.defs), child.defs);
    child.parent = this.defined ? this : this.parent;
  }

  addVar(name: string, definition: any) {
    if (Object.prototype.hasOwnProperty.call(this.defs, name)) {
      throw new Error(
        `Cannot define "${name}" variable twice in the same suite.`
      );
    }

    this.defined = true;
    this.defs[name] = new VariableMetadata(name, definition, this);

    return this;
  }

  addAliasFor(name: string, aliasName: string) {
    this.defs[aliasName] = this.defs[name].addName(aliasName);
  }

  releaseVars() {
    if (this.hasValues) {
      this.values = {};
      this.hasValues = false;
    }
  }

  lookupMetadataFor(varName: string) {
    const varMeta = this.defs[varName];
    const definedIn = varMeta.parent;

    if (!varMeta || !definedIn.parent || !definedIn.parent.defs[varName]) {
      throw new Error(`Unknown parent variable "${varName}".`);
    }

    return definedIn.parent;
  }

  addExamplesFor(name: string, definition: any) {
    const examplesName = EXAMPLES_PREFIX + name;

    if (Object.prototype.hasOwnProperty.call(this.defs, examplesName)) {
      throw new Error(`Attempt to override "${name}" shared example`);
    }

    return this.addVar(examplesName, definition);
  }

  runExamplesFor(name: string, args: any[]) {
    const examples = this.defs[EXAMPLES_PREFIX + name];

    if (!examples) {
      throw new Error(
        `Attempt to include not defined shared behavior "${name}"`
      );
    }

    return examples.value(...args);
  }
}
