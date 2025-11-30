export interface GetVar {
	(name: string): any;
	variable(name: string): any;
	definitionOf(name: string): any;
}

export const get: GetVar;
export function def(name: string, implementation: () => any): void;
export function subject(name: string, implementation: () => any): void;
export function subject(implementation: () => any): void;
export function sharedExamplesFor(
	name: string,
	implementation: (...args: any[]) => void,
): void;
export function includeExamplesFor(name: string, ...args: any[]): void;
export function itBehavesLike(name: string, ...args: any[]): void;
