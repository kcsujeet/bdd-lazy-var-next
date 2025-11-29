const identity = <T>(x: T): T => x;

export const symbolFor = typeof Symbol === "undefined" ? identity : Symbol.for;

export default {
  for: symbolFor,
};
