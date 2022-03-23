/// <reference path="./code.d.ts" />

import ExplorableGraph from "../core/ExplorableGraph.js";
import * as ops from "./ops.js";

/**
 * Evaluate the given code and return the result.
 *
 * `this` should be the context in which the code will be evaluated, so you will
 * normally invoke this function as `execute.call(myContext)`. The context can
 * expose a `scope` property that is a graph that will be searched to look up
 * the names of things to execute.
 *
 * @this {any}
 * @param {Code} code
 */
export default async function execute(code) {
  const context = this;

  if (code === ops.scope) {
    // ops.scope is a placeholder for the context's scope. If the context
    // doesn't define a scope, assume the context is a graph and use the context
    // itself as the scope.
    return /** @type {any} */ (context).scope ?? context;
  } else if (!(code instanceof Array)) {
    // Simple scalar; return as is.
    return code;
  }

  let evaluated;
  if (code[0] === ops.lambda) {
    // Don't evaluate instructions, use as is.
    evaluated = code;
  } else {
    // Evaluate each instruction in the code.
    evaluated = await Promise.all(
      code.map((instruction) => execute.call(context, instruction))
    );
  }

  // The head of the array is a graph or function, the rest are args or keys.
  let [fn, ...args] = evaluated;

  if (fn === undefined) {
    // The most common cause of an undefined function at this point is that the
    // code tried to get a member that doesn't exist in the local graph. To
    // give a better error message for that common case, we inspect the code to
    // see if it was a get.
    const name =
      code instanceof Array &&
      code[0] instanceof Array &&
      code[0][0] === ops.scope
        ? code[0][1]
        : "(unknown)";
    throw ReferenceError(`Couldn't find function or graph key: ${name}`);
  }

  // If the "function" is currently an object with a .toFunction() method, get
  // the real function from that.
  if (typeof fn !== "function" && fn.toFunction) {
    fn = fn.toFunction();
  }

  try {
    const result =
      fn instanceof Function
        ? // Invoke the function
          await fn.call(context, ...args)
        : // Traverse the graph.
          await ExplorableGraph.traverseOrThrow(fn, ...args);
    return result;
  } catch (/** @type {any} */ error) {
    console.error(`An Origami expression triggered an exception:`);
    console.error(JSON.stringify(code));
    console.error(error.stack);
    return undefined;
  }
}
