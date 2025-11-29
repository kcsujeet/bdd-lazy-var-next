import { Metadata } from "./metadata";
import Symbol from "../utils/symbol";

const CURRENTLY_RETRIEVED_VAR_FIELD = Symbol.for("__currentVariableStack");
const last = <T>(array: T[] | undefined): T | null =>
  array ? array[array.length - 1] : null;

export class Variable {
  static EMPTY = new Variable(null, null);

  static allocate(varName: string, options: { in: any }) {
    const variable = new this(varName, options.in);

    return variable.addToStack();
  }

  static evaluate(varName: string, options: { in: any }) {
    if (!options.in) {
      throw new Error(
        `It looke like you are trying to evaluate "${varName}" too early. Evaluation context is undefined`
      );
    }

    let variable = Variable.fromStack(options.in);

    if (variable.isSame(varName)) {
      return variable.valueInParentContext(varName);
    }

    try {
      variable = Variable.allocate(varName, options);
      return variable.value();
    } finally {
      variable.pullFromStack();
    }
  }

  static fromStack(context: any) {
    return last(context[CURRENTLY_RETRIEVED_VAR_FIELD]) || Variable.EMPTY;
  }

  name: string | null;

  context: any;

  evaluationMeta: Metadata | null;

  constructor(varName: string | null, context: any) {
    this.name = varName;
    this.context = context;
    this.evaluationMeta = context ? Metadata.of(context) : null;
  }

  isSame(anotherVarName: string) {
    return (
      this.name &&
      (this.name === anotherVarName ||
        Metadata.of(this.context, this.name).isNamedAs(anotherVarName))
    );
  }

  value() {
    return this.evaluationMeta && this.evaluationMeta.getVar(this.name!);
  }

  addToStack() {
    this.context[CURRENTLY_RETRIEVED_VAR_FIELD] =
      this.context[CURRENTLY_RETRIEVED_VAR_FIELD] || [];
    this.context[CURRENTLY_RETRIEVED_VAR_FIELD].push(this);

    return this;
  }

  pullFromStack() {
    this.context[CURRENTLY_RETRIEVED_VAR_FIELD].pop();
  }

  valueInParentContext(varOrAliasName: string) {
    const meta = this.evaluationMeta;

    if (!meta) return undefined;

    try {
      this.evaluationMeta = meta.lookupMetadataFor(varOrAliasName);
      return this.evaluationMeta.evaluate(varOrAliasName);
    } finally {
      this.evaluationMeta = meta;
    }
  }
}

export default Variable;
