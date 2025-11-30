import { humanize, parseMessage } from "../utils/parse_message";
import { Metadata } from "./metadata";
import type { SuiteTracker } from "./suite_tracker";
import { Variable } from "./variable";

export default (context: any, tracker: SuiteTracker, options: any) => {
	const get: any = (varName: string) => {
		return Variable.evaluate(varName, { in: tracker.currentContext });
	};

	get.definitionOf = get.variable = (varName: string) =>
		get.bind(null, varName);

	function runHook(name: string, suite: any, varName: string) {
		if (name && typeof options[name] === "function") {
			options[name](suite, varName, context);
		}
	}

	function def(varName: string | string[], definition: any) {
		const suite = tracker.currentlyDefinedSuite;

		if (!Array.isArray(varName)) {
			Metadata.ensureDefinedOn(suite).addVar(varName, definition);
			runHook("onDefineVariable", suite, varName as string);
			return;
		}

		const [name, ...aliases] = varName;
		def(name, definition);

		const metadata = Metadata.of(suite);
		aliases.forEach((alias) => {
			metadata.addAliasFor(name, alias);
			runHook("onDefineVariable", suite, alias);
		});
	}

	function subject(...args: any[]) {
		const [name, definition] = args;

		if (args.length === 1) {
			return def("subject", name);
		}

		if (args.length === 2) {
			return def([name, "subject"], definition);
		}

		return get("subject");
	}

	function sharedExamplesFor(name: string, defs: any) {
		Metadata.ensureDefinedOn(tracker.currentlyDefinedSuite).addExamplesFor(
			name,
			defs,
		);
	}

	function includeExamplesFor(nameOrFn: string | Function, ...args: any[]) {
		const meta = Metadata.ensureDefinedOn(tracker.currentlyDefinedSuite);

		if (typeof nameOrFn === "function") {
			nameOrFn(...args);
		} else {
			meta.runExamplesFor(nameOrFn, args);
		}
	}

	function itBehavesLike(nameOrFn: string | Function, ...args: any[]) {
		const title =
			typeof nameOrFn === "function"
				? humanize(nameOrFn.name || "this")
				: nameOrFn;

		context.describe(`behaves like ${title}`, () => {
			includeExamplesFor(nameOrFn, ...args);
		});
	}

	const wrapIt = (test: Function, shouldWrapAssert: boolean) =>
		function it(this: any, ...args: any[]) {
			if (typeof args[0] === "function") {
				args.unshift(parseMessage(args[0]));
			}

			if (shouldWrapAssert) {
				const assert = args[1];
				args[1] = function testWrapper(this: any, ...testArgs: any[]) {
					const value = assert.apply(this, testArgs);
					return value && typeof value.then === "function" ? value : undefined;
				};
			}

			return test(...args);
		};

	return {
		subject,
		def,
		get,
		wrapIt,
		sharedExamplesFor,
		includeExamplesFor,
		itBehavesLike,
	};
};
