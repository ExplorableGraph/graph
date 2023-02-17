#!/usr/bin/env node

import toYaml from "../builtins/yaml.js";
import builtins from "../cli/builtins.js";
import { incrementCount } from "../core/measure.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import execute from "../language/execute.js";
import * as parse from "../language/parse.js";

/**
 * Parse an Origami expression, evaluate it in the context of a graph (provided
 * by `this`), and return the result as text.
 *
 * @this {Explorable}
 * @param {string} expression
 * @returns {Promise<string | String | Buffer | undefined>}
 */
export default async function ori(expression) {
  assertScopeIsDefined(this);
  // In case expression is a Buffer, cast it to a string.
  expression = String(expression).trim();

  // Obtain the scope from `this` or builtins.
  let scope = this ?? builtins;

  // Parse
  incrementCount("ori parse");
  const parsed = parse.expression(expression);
  let code = parsed?.value;
  if (!code || parsed.rest !== "") {
    console.error(`ori: could not recognize expression: ${expression}`);
    return;
  }

  // Execute
  let result = await execute.call(scope, code);

  // If result was a function, execute it.
  if (typeof result === "function") {
    result = await result.call(scope);
  }

  const formatted = await formatResult(this, result);
  return formatted;
}

async function formatResult(scope, result) {
  const stringOrBuffer =
    typeof result === "string" ||
    (globalThis.Buffer && result instanceof Buffer);
  let output = stringOrBuffer
    ? result
    : result instanceof String
    ? result.toString()
    : result !== undefined
    ? await toYaml.call(scope, result)
    : undefined;
  return output;
}

ori.usage = `ori <text>\tEvaluates the Origami expression`;
ori.documentation = "https://graphorigami.org/cli/builtins.html#ori";
