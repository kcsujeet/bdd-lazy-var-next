export interface GetVar {
	<T = any>(name: string): T;
	variable<T = any>(name: string): () => T;
	definitionOf<T = any>(name: string): () => T;
}

export const get: GetVar;

export function def<T = any>(
	name: string | string[],
	implementation: () => T,
): void;

export function subject<T = any>(name: string, implementation: () => T): void;
export function subject<T = any>(implementation: () => T): void;
export function subject<T = any>(): T;

export function sharedExamplesFor(
	name: string,
	implementation: (...args: any[]) => void,
): void;
export function includeExamplesFor(name: string, ...args: any[]): void;
export function itBehavesLike(name: string, ...args: any[]): void;
