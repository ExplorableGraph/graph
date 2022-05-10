/// <reference path="./code.d.ts" />

import concatBuiltin from "../builtins/concat.js";
import execute from "./execute.js";

/**
 * Return a function that will invoke the given code.
 *
 * @this {Explorable}
 * @param {Code} code
 */
export function lambda(code) {
  /** @this {Explorable} */
  return async function () {
    const result = await execute.call(this, code);
    return result;
  };
}
lambda.toString = () => "«ops.lambda»";

// The scope op is a placeholder for the graph's scope.
export const scope = "«ops.scope»";

// The `thisKey` op is a placeholder that represents the key of the object that
// resulted in the current code.
export const thisKey = "«ops.thisKey»";

// The variable op is a placeholder that represents a variable.
export const variable = "«ops.variable»";

/**
 * Get the key from the current graph and, if it's a function, invoke it.
 *
 * @this {Explorable}
 * @param {any} key
 */
export async function implicitCall(key) {
  let value = await this.get(key);
  if (typeof value === "function") {
    value = await value.call(this);
  }
  return value;
}

/**
 * Concatenate the given arguments.
 *
 * @this {Explorable}
 * @param {any[]} args
 */
export async function concat(...args) {
  return concatBuiltin.call(this, ...args);
}
concat.toString = () => "«ops.concat»";
